/**
 * AI 3D Generation Type Definitions
 */

export type AI3DProvider = 'meshy' | 'tripo';

export type AI3DJobStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';

export interface ThirdPartyStatus {
  status: string;
  progress: number;
  error?: string;
  model_urls?: {
    glb?: string;
    usdz?: string;
  };
}

export interface SizeInfo {
  originalSizeMB: string;
  compressedSizeMB: string;
  reductionPercent: string;
}

export interface ProcessedModelResult {
  glbUrl: string;
  usdzUrl?: string;
  sizeInfo: SizeInfo;
}

export interface JobStatusResponse {
  id: string;
  productId: number;
  status: AI3DJobStatus;
  glbUrl?: string;
  metadata?: unknown;
  error?: string;
  progress: number;
}
