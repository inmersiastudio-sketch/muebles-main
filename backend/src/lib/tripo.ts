import { env } from "../config/env.js";
import axios from "axios";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const TRIPO_API_BASE = "https://api.tripo3d.ai/v2/openapi";
const TRIPO_TASK_URL = `${TRIPO_API_BASE}/task`;
const TRIPO_STS_URL = `${TRIPO_API_BASE}/upload/sts/token`;
const TRIPO_BALANCE_URL = `${TRIPO_API_BASE}/user/balance`;

export interface TripoTaskResponse {
    status: "submitted" | "processing" | "success" | "failed";
    model?: string;
    progress?: number;
    message?: string;
    taskId?: string;
}

/**
 * Cliente para interactuar con la API de Tripo3D v2
 * Flujo: STS Token → S3 Upload → multiview_to_model
 */
export class TripoClient {
    private apiKey: string;

    constructor() {
        if (!env.TRIPO_API_KEY) {
            throw new Error("TRIPO_API_KEY no está configurada en .env");
        }
        this.apiKey = env.TRIPO_API_KEY;
    }

    private get headers() {
        return {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
        };
    }

    /**
     * Verifica el saldo de la cuenta Tripo
     */
    async checkBalance(): Promise<{ balance: number; frozen: number }> {
        const res = await axios.get(TRIPO_BALANCE_URL, { headers: this.headers });
        if (res.data?.code !== 0) {
            throw new Error(`Error checking balance: ${JSON.stringify(res.data)}`);
        }
        return res.data.data;
    }

    /**
     * Obtiene credenciales STS temporales para subir una imagen a Tripo S3
     */
    private async getStsToken(format: string = "jpeg"): Promise<{
        sts_ak: string;
        sts_sk: string;
        session_token: string;
        bucket: string;
        resource_uri: string;
        resource_bucket: string;
        s3_endpoint?: string;
        region?: string;
    }> {
        console.log(`[Tripo] Requesting STS token for format: ${format}`);
        const res = await axios.post(TRIPO_STS_URL, { format }, { headers: this.headers });

        if (res.data?.code !== 0 || !res.data?.data) {
            throw new Error(`Error getting STS token: ${JSON.stringify(res.data)}`);
        }

        const d = res.data.data;
        console.log(`[Tripo] Full STS response:`, JSON.stringify(d, null, 2));

        // The bucket field may vary by API version
        const s3Bucket = d.resource_bucket || d.bucket || "tripo-data";
        const resourceBucket = d.resource_bucket || s3Bucket;
        // Extract region from s3_host (e.g. "s3.us-west-2.amazonaws.com" → "us-west-2")
        let region = d.region || d.s3_region || "us-west-2";
        if (d.s3_host && d.s3_host.includes(".amazonaws.com")) {
            const match = d.s3_host.match(/s3[.-]([a-z0-9-]+)\.amazonaws\.com/);
            if (match) region = match[1];
        }
        const s3Endpoint = d.s3_endpoint || d.endpoint || (d.s3_host ? `https://${d.s3_host}` : undefined);

        console.log(`[Tripo] STS: bucket=${s3Bucket}, region=${region}, endpoint=${s3Endpoint}`);
        return {
            sts_ak: d.sts_ak,
            sts_sk: d.sts_sk,
            session_token: d.session_token,
            bucket: s3Bucket,
            resource_uri: d.resource_uri,
            resource_bucket: resourceBucket,
            s3_endpoint: s3Endpoint,
            region: region,
        };
    }

    /**
     * Sube una imagen (desde URL) a Tripo S3 usando credenciales STS.
     * Retorna { bucket, key } para usar en la creación de la tarea.
     */
    async uploadImageViaSTS(imageUrl: string): Promise<{ bucket: string; key: string; format: string }> {
        // Detectar formato
        let format = "jpeg";
        const lower = imageUrl.toLowerCase();
        if (lower.includes(".png") || lower.includes("format=png")) format = "png";
        else if (lower.includes(".webp")) format = "webp";

        // 1. Obtener credenciales STS
        const sts = await this.getStsToken(format);

        // 2. Descargar la imagen
        console.log(`[Tripo] Downloading image: ${imageUrl}`);
        const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(imgRes.data);
        console.log(`[Tripo] Image downloaded: ${buffer.length} bytes`);

        // 3. Upload directly via PUT to Tripo's S3
        const mimeMap: Record<string, string> = {
            jpeg: "image/jpeg", jpg: "image/jpeg",
            png: "image/png", webp: "image/webp",
        };
        const contentType = mimeMap[format] || "image/jpeg";
        const s3Url = `https://${sts.bucket}.s3.${sts.region || "us-west-2"}.amazonaws.com/${sts.resource_uri}`;

        console.log(`[Tripo] Uploading to S3: ${s3Url}`);

        // Use AWS SDK S3Client with the correct region
        const s3 = new S3Client({
            region: sts.region || "us-west-2",
            credentials: {
                accessKeyId: sts.sts_ak,
                secretAccessKey: sts.sts_sk,
                sessionToken: sts.session_token,
            },
        });

        try {
            await s3.send(new PutObjectCommand({
                Bucket: sts.bucket,
                Key: sts.resource_uri,
                Body: buffer,
                ContentType: contentType,
            }));
            console.log(`[Tripo] ✅ Image uploaded successfully via AWS SDK`);
        } catch (sdkError: any) {
            // If SDK fails, try direct PUT with presigned-style approach
            console.log(`[Tripo] SDK upload failed (${sdkError.Code || sdkError.message}), trying direct PUT...`);

            // Use the @aws-sdk/s3-request-presigner approach or direct upload
            // Fall back to using the old direct upload endpoint
            const FormData = (await import("form-data")).default;
            const form = new FormData();
            form.append("file", buffer, {
                filename: `upload.${format}`,
                contentType: contentType,
            });

            const uploadRes = await axios.post(`${TRIPO_API_BASE}/upload`, form, {
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    ...form.getHeaders(),
                },
            });

            if (uploadRes.data?.code !== 0 || !uploadRes.data?.data?.image_token) {
                throw new Error(`Upload failed: ${JSON.stringify(uploadRes.data)}`);
            }

            // For direct upload, we return the image_token as the key
            console.log(`[Tripo] ✅ Image uploaded via direct upload, token: ${uploadRes.data.data.image_token}`);
            return {
                bucket: "__direct_upload__",
                key: uploadRes.data.data.image_token,
                format,
            };
        }

        return {
            bucket: sts.resource_bucket,
            key: sts.resource_uri,
            format,
        };
    }

    /**
     * Crea un trabajo Multi-View Image-to-3D.
     * El array files debe tener exactamente 4 items: [frente, izquierda, atrás, derecha]
     * El frente es obligatorio, los demás pueden ser {}
     */
    async createMultiviewTask(imageUrls: string[]): Promise<string> {
        if (imageUrls.length < 1) {
            throw new Error("Se requiere al menos 1 imagen (frente) para la generación.");
        }

        console.log(`[Tripo] Starting upload for ${imageUrls.length} images...`);

        // Upload all images via STS (with fallback)
        const uploaded: { bucket: string; key: string; format: string }[] = [];
        for (const url of imageUrls) {
            const result = await this.uploadImageViaSTS(url);
            uploaded.push(result);
        }

        let body: any;

        // High quality settings for furniture
        const qualityParams = {
            model_version: "v3.0-20250812",       // Latest high-quality model
            texture: true,
            pbr: true,
            texture_quality: "detailed",           // 4K textures
            texture_alignment: "original_image",   // Faithful to source photo
            auto_size: true,
        };

        if (uploaded.length === 1) {
            // Single image: use image_to_model
            const img = uploaded[0];
            const fileRef = img.bucket === "__direct_upload__"
                ? { type: img.format === "png" ? "png" : "jpeg", file_token: img.key }
                : { type: img.format === "png" ? "png" : "jpeg", object: { bucket: img.bucket, key: img.key } };

            body = {
                type: "image_to_model",
                file: fileRef,
                ...qualityParams,
            };
        } else {
            // Multiple images: use multiview_to_model
            const filesPayload: any[] = [{}, {}, {}, {}];
            for (let i = 0; i < Math.min(uploaded.length, 4); i++) {
                if (uploaded[i].bucket === "__direct_upload__") {
                    filesPayload[i] = {
                        type: uploaded[i].format === "png" ? "png" : "jpeg",
                        file_token: uploaded[i].key,
                    };
                } else {
                    filesPayload[i] = {
                        type: uploaded[i].format === "png" ? "png" : "jpeg",
                        object: {
                            bucket: uploaded[i].bucket,
                            key: uploaded[i].key,
                        },
                    };
                }
            }

            body = {
                type: "multiview_to_model",
                files: filesPayload,
                ...qualityParams,
            };
        }

        console.log(`[Tripo] Creating task...`, JSON.stringify(body, null, 2));

        try {
            const res = await axios.post(TRIPO_TASK_URL, body, { headers: this.headers });
            const data = res.data;

            if (data.code !== 0) {
                throw new Error(`Error Tripo3D: ${data.message || "Desconocido"}`);
            }

            const taskId = data.data?.task_id || data.data?.taskId;
            if (!taskId) {
                throw new Error("Tripo3D no devolvió un task_id válido");
            }

            console.log(`[Tripo] ✅ Task created: ${taskId}`);
            return taskId;
        } catch (err: any) {
            // Log the full error response for debugging
            if (err.response) {
                console.error(`[Tripo] Task creation failed:`, err.response.status, JSON.stringify(err.response.data));
            }
            throw err;
        }
    }

    /**
     * Consulta el estado de un trabajo generado previamente.
     */
    async getTaskStatus(taskId: string): Promise<TripoTaskResponse> {
        const response = await fetch(`${TRIPO_TASK_URL}/${taskId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error de estado Tripo3D: ${data.message || response.statusText}`);
        }

        const statusObj = data.data;
        const status = statusObj?.status?.toLowerCase();

        // Obtener modelo final si es exitoso
        const outputGroup = statusObj?.output || statusObj?.result;
        const modelUrl = outputGroup?.model || outputGroup?.base_model || outputGroup?.pbr_model;
        const progress = statusObj?.progress;

        return {
            status: status as any,
            model: modelUrl,
            progress: progress || (status === "success" ? 100 : 0),
            message: data.message,
            taskId: taskId,
        };
    }
}
