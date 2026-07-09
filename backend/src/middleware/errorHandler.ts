import { ErrorRequestHandler, Response as ExpressResponse, RequestHandler, Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { env } from '../config/env.js';

/**
 * Centralized Error Handling Middleware
 * Catches all errors and returns standardized responses
 */

interface ErrorResponse {
  error: ErrorCode | 'INTERNAL_ERROR';
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

function sendErrorResponse(res: ExpressResponse, statusCode: number, response: ErrorResponse): void {
  res.status(statusCode).json(response);
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req,
  res,
  _next
): void => {
  // Handle operational errors (expected application errors)
  if (err instanceof AppError) {
    sendErrorResponse(res, err.statusCode, {
      error: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError' && 'issues' in err) {
    const zodError = err as { issues: Array<{ path: (string | number)[]; message: string }> };
    const formattedErrors = zodError.issues.reduce((acc, issue) => {
      const path = issue.path.join('.');
      acc[path] = issue.message;
      return acc;
    }, {} as Record<string, string>);

    sendErrorResponse(res, 400, {
      error: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: { fields: formattedErrors },
    });
    return;
  }

  // Handle Prisma errors
  if (err.name?.startsWith('Prisma')) {
    const prismaError = err as { code?: string; meta?: { target?: string[] } };
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      sendErrorResponse(res, 409, {
        error: ErrorCode.CONFLICT,
        message: 'Resource already exists',
        ...(prismaError.meta?.target && { 
          details: { fields: prismaError.meta.target } 
        }),
      });
      return;
    }

    // Foreign key constraint violation
    if (prismaError.code === 'P2003') {
      sendErrorResponse(res, 400, {
        error: ErrorCode.BAD_REQUEST,
        message: 'Related resource not found',
      });
      return;
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      sendErrorResponse(res, 404, {
        error: ErrorCode.NOT_FOUND,
        message: 'Resource not found',
      });
      return;
    }
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Send generic error response for unexpected errors
  sendErrorResponse(res, 500, {
    error: ErrorCode.INTERNAL_ERROR,
    message: env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async route handler wrapper
 * Eliminates need for try/catch in route handlers
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
