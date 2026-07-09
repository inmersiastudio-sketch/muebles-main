import type { Request, Response } from 'express';
import { ai3dService } from '../services/AI3DService.js';
import { Errors } from '../errors/AppError.js';
import { generate3DSchema, jobIdParamSchema, productIdParamSchema } from '../schemas/ai3d.js';
import type { AuthContext } from '../types/product.js';
import type { AuthenticatedRequest } from '../lib/auth.js';

/**
 * AI3DController - HTTP Layer for 3D Generation
 */

function getAuthContext(req: Request): AuthContext {
  const authReq = req as AuthenticatedRequest;
  return {
    id: authReq.user!.id,
    role: authReq.user!.role,
    storeId: authReq.user!.storeId,
  };
}

export class AI3DController {
  /**
   * POST /api/admin/ai-3d/generate
   * Create a new 3D generation job
   */
  async generate(req: Request, res: Response): Promise<void> {
    const parsed = generate3DSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Invalid payload', parsed.error.flatten());
    }

    const { productId, imageUrl, imageUrls, provider } = parsed.data;
    const finalUrls = imageUrls || (imageUrl ? [imageUrl] : []);

    if (finalUrls.length === 0) {
      throw Errors.validation('At least one image URL is required');
    }

    const user = getAuthContext(req);
    
    // Allow disabling background removal via query param (skipProcessing=true)
    const skipProcessing = req.query.skipProcessing === 'true';

    const result = await ai3dService.createJob(
      productId, 
      finalUrls, 
      provider, 
      user,
      !skipProcessing // processImages = true by default
    );

    res.json({
      success: true,
      jobId: result.jobId,
      taskId: result.taskId,
      processedImageUrls: result.processedImageUrls,
      originalUrls: finalUrls,
      backgroundRemoved: !skipProcessing,
      message: '3D generation started with background removal. Check status with GET /api/admin/ai-3d/jobs/:id/status',
    });
  }

  /**
   * GET /api/admin/ai-3d/jobs/:jobId/status
   * Check status of a 3D generation job
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    const parsed = jobIdParamSchema.safeParse({ jobId: req.params.jobId });
    if (!parsed.success) {
      throw Errors.validation('Invalid job ID');
    }

    const user = getAuthContext(req);
    const status = await ai3dService.checkJobStatus(parsed.data.jobId, user);

    res.json(status);
  }

  /**
   * GET /api/admin/ai-3d/jobs/product/:productId
   * Get all 3D generation jobs for a product
   */
  async getProductJobs(req: Request, res: Response): Promise<void> {
    const parsed = productIdParamSchema.safeParse({ productId: req.params.productId });
    if (!parsed.success) {
      throw Errors.validation('Invalid product ID');
    }

    const user = getAuthContext(req);
    const jobs = await ai3dService.getProductJobs(parsed.data.productId, user);

    res.json({ jobs });
  }

  /**
   * GET /api/admin/ai-3d/jobs
   * Get all 3D generation jobs for the store
   */
  async getStoreJobs(req: Request, res: Response): Promise<void> {
    const user = getAuthContext(req);
    if (!user.storeId) {
      throw Errors.forbidden('This user account is not associated with any store');
    }

    const jobs = await ai3dService.getStoreJobs(user.storeId, user);
    res.json({ jobs });
  }
}

// Export singleton
export const ai3dController = new AI3DController();
