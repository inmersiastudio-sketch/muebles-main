import { env } from "../config/env.js";

const MESHY_API_BASE = "https://api.meshy.ai/openapi/v1";

export interface MeshyImageTo3DRequest {
  imageUrl: string;
  enablePbr?: boolean;
  aiModel?: "meshy-5" | "meshy-6" | "latest";
}

export interface MeshyTaskResponse {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usdz?: string;
  };
  thumbnail_url?: string;
  error?: string;
}

/**
 * Create a image-to-3D task with Meshy AI
 * Docs: https://docs.meshy.ai/api-image-to-3d
 */
export async function createImageTo3DTask(params: MeshyImageTo3DRequest): Promise<string> {
  const apiKey = env.MESHY_API_KEY;
  if (!apiKey) {
    throw new Error("MESHY_API_KEY not configured");
  }

  const response = await fetch(`${MESHY_API_BASE}/image-to-3d`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: params.imageUrl,
      enable_pbr: params.enablePbr ?? true,
      ai_model: params.aiModel ?? "latest",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meshy API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.result; // task ID
}

/**
 * Get status of a 3D generation task
 */
export async function getTaskStatus(taskId: string): Promise<MeshyTaskResponse> {
  const apiKey = env.MESHY_API_KEY;
  if (!apiKey) {
    throw new Error("MESHY_API_KEY not configured");
  }

  const response = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meshy API error: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Download GLB file from Meshy and return as Buffer
 */
export async function downloadGLB(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Could not read error body");
    throw new Error(`Failed to download GLB: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
