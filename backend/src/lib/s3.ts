import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

function getS3Client() {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_REGION) {
    throw new Error("AWS credentials missing in .env");
  }
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload a GLB file to S3 bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadGLBToS3(
  buffer: Buffer,
  key: string,
  contentType = "model/gltf-binary"
): Promise<{ url: string; key: string; publicId: string }> {
  const client = getS3Client();
  const bucketName = env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME missing in .env");
  }

  // Ensure key ends with .glb if not already present
  const finalKey = key.endsWith(".glb") ? key : `${key}.glb`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: finalKey,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  // Construct public URL
  const url = `https://${bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${finalKey}`;
  return { url, key: finalKey, publicId: finalKey };
}

/**
 * Upload a USDZ file to S3 bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadUSDZToS3(
  buffer: Buffer,
  key: string,
  contentType = "model/vnd.usdz+zip"
): Promise<{ url: string; key: string; publicId: string }> {
  const client = getS3Client();
  const bucketName = env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME missing in .env");
  }

  // Ensure key ends with .usdz if not already present
  const finalKey = key.endsWith(".usdz") ? key : `${key}.usdz`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: finalKey,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  // Construct public URL
  const url = `https://${bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${finalKey}`;
  return { url, key: finalKey, publicId: finalKey };
}

/**
 * Delete a file from S3 bucket.
 */
export async function deleteFromS3(key: string): Promise<void> {
  const client = getS3Client();
  const bucketName = env.AWS_BUCKET_NAME;

  if (!bucketName) return;

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await client.send(command);
  } catch (err) {
    console.error(`Failed to delete S3 object ${key}:`, err);
    // Don't throw, just log
  }
}
