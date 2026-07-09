/**
 * Custom Application Error Classes
 * Standardized error handling across the backend
 */

export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
}

interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    this.timestamp = new Date().toISOString();

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

// Convenience factory methods for common errors
export const Errors = {
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError({ code: ErrorCode.BAD_REQUEST, message, statusCode: 400, details }),

  unauthorized: (message = 'Unauthorized') =>
    new AppError({ code: ErrorCode.UNAUTHORIZED, message, statusCode: 401 }),

  forbidden: (message = 'Forbidden') =>
    new AppError({ code: ErrorCode.FORBIDDEN, message, statusCode: 403 }),

  notFound: (resource: string) =>
    new AppError({ code: ErrorCode.NOT_FOUND, message: `${resource} not found`, statusCode: 404 }),

  conflict: (message: string) =>
    new AppError({ code: ErrorCode.CONFLICT, message, statusCode: 409 }),

  validation: (message: string, details?: Record<string, unknown>) =>
    new AppError({ code: ErrorCode.VALIDATION_ERROR, message, statusCode: 400, details }),

  rateLimited: (message = 'Too many requests') =>
    new AppError({ code: ErrorCode.RATE_LIMITED, message, statusCode: 429 }),

  emailNotVerified: (message = 'Email no verificado') =>
    new AppError({ code: ErrorCode.EMAIL_NOT_VERIFIED, message, statusCode: 403 }),

  tokenExpired: (message = 'Token expirado') =>
    new AppError({ code: ErrorCode.TOKEN_EXPIRED, message, statusCode: 400 }),

  tokenInvalid: (message = 'Token inválido') =>
    new AppError({ code: ErrorCode.TOKEN_INVALID, message, statusCode: 400 }),

  internal: (message = 'Internal server error') =>
    new AppError({ 
      code: ErrorCode.INTERNAL_ERROR, 
      message, 
      statusCode: 500, 
      isOperational: false 
    }),
};
