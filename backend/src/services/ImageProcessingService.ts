import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env.js';
import { Errors } from '../errors/AppError.js';

/**
 * ImageProcessingService - Handles background removal via Photoroom API
 * Cloud-based processing to avoid local CPU/GPU crashes
 */

export class ImageProcessingService {
  private readonly photoroomApiKey: string;
  private readonly photoroomEndpoint = 'https://sdk.photoroom.com/v1/segment';

  constructor() {
    this.photoroomApiKey = env.PHOTOROOM_API_KEY || '';
    if (!this.photoroomApiKey) {
      console.warn('PHOTOROOM_API_KEY not configured - background removal will be skipped');
    }
  }

  /**
   * Download image from URL to buffer
   */
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Amobly-ImageProcessor/1.0',
        },
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw Errors.internal('Failed to download image for processing');
    }
  }

  /**
   * Remove background using Photoroom API
   * Returns URL of processed image with transparent background
   */
  private async removeBackgroundWithPhotoroom(imageBuffer: Buffer, originalUrl: string): Promise<string | Buffer> {
    if (!this.photoroomApiKey) {
      console.warn('Photoroom API key not configured, skipping background removal');
      return originalUrl;
    }

    try {
      console.log('Removing background with Photoroom API...');

      const formData = new FormData();
      formData.append('image_file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg',
      });

      const response = await axios.post(this.photoroomEndpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': this.photoroomApiKey,
        },
        responseType: 'arraybuffer',
        timeout: 60000, // Photoroom can take time
      });

      // Photoroom returns the processed image as binary
      const processedBuffer = Buffer.from(response.data);
      console.log(`Background removed: ${processedBuffer.length} bytes`);

      return processedBuffer;
    } catch (error: any) {
      console.error('Photoroom API error:', error.response?.data || error.message);
      throw Errors.internal('Failed to remove background via Photoroom API');
    }
  }

  /**
   * Upload processed image to Cloudinary with white background
   * Uses Cloudinary's transformation to add white background behind transparent PNG
   */
  private async uploadWithWhiteBackground(transparentBuffer: Buffer): Promise<string> {
    try {
      console.log('Uploading to Cloudinary with white background...');

      // Import cloudinary dynamically
      const { v2: cloudinary } = await import('cloudinary');

      return new Promise((resolve, reject) => {
        // Upload with background color transformation
        // We use the 'background' parameter to add white behind the transparent image
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'processed-3d',
            resource_type: 'image',
            format: 'jpg',
            // Add white background transformation
            background: '#FFFFFF',
            // Ensure proper handling of transparency
            flags: 'preserve_transparency',
          } as any,
          (error, result) => {
            if (error || !result) {
              console.error('Cloudinary upload error:', error);
              reject(error || new Error('Upload failed'));
            } else {
              console.log(`Uploaded to Cloudinary: ${result.secure_url}`);
              resolve(result.secure_url);
            }
          }
        );

        uploadStream.end(transparentBuffer);
      });
    } catch (error) {
      console.error('Error uploading with white background:', error);
      throw error;
    }
  }

  /**
   * Alternative: Generate Cloudinary URL with white background transformation
   * This is faster as it doesn't require re-uploading
   */
  private async getWhiteBackgroundUrl(publicId: string): Promise<string> {
    try {
      const { v2: cloudinary } = await import('cloudinary');
      
      // Generate URL with white background transformation
      const url = cloudinary.url(publicId, {
        transformation: [
          { background: '#FFFFFF' },
          { fetch_format: 'auto', quality: 'auto' },
        ],
      });

      return url;
    } catch (error) {
      console.error('Error generating white background URL:', error);
      throw error;
    }
  }

  /**
   * Main processing pipeline using Photoroom API:
   * 1. Download image
   * 2. Send to Photoroom API for background removal
   * 3. Upload to Cloudinary with white background
   * 4. Return processed URL
   */
  async processImageFor3D(imageUrl: string): Promise<string> {
    console.log(`Processing image for 3D generation: ${imageUrl}`);

    // Skip if no API key
    if (!this.photoroomApiKey) {
      console.warn('Photoroom API not configured, using original image');
      return imageUrl;
    }

    try {
      // Step 1: Download original image
      const originalBuffer = await this.downloadImage(imageUrl);
      console.log(`Downloaded image: ${originalBuffer.length} bytes`);

      // Step 2: Remove background with Photoroom API
      // Photoroom returns a PNG with transparent background
      const processedResult = await this.removeBackgroundWithPhotoroom(originalBuffer, imageUrl);
      
      // If we got a string back, it means we skipped processing
      if (typeof processedResult === 'string') {
        return processedResult;
      }

      // Step 3: Upload to Cloudinary with white background
      const finalUrl = await this.uploadWithWhiteBackground(processedResult);

      console.log(`Image processing complete: ${finalUrl}`);
      return finalUrl;

    } catch (error) {
      console.error('Image processing failed:', error);
      
      // Fallback to original URL
      console.warn('Using original image URL as fallback');
      return imageUrl;
    }
  }

  /**
   * Process multiple images for multiview 3D generation
   */
  async processMultipleImages(imageUrls: string[]): Promise<string[]> {
    // Skip processing if no API key
    if (!this.photoroomApiKey) {
      console.warn('Photoroom API not configured, using original images');
      return imageUrls;
    }

    console.log(`Processing ${imageUrls.length} images with Photoroom API...`);
    
    const processedUrls: string[] = [];
    
    for (const url of imageUrls) {
      try {
        const processedUrl = await this.processImageFor3D(url);
        processedUrls.push(processedUrl);
      } catch (error) {
        console.error(`Failed to process image ${url}:`, error);
        // Use original URL if processing fails
        processedUrls.push(url);
      }
    }

    return processedUrls;
  }
}

// Export singleton
export const imageProcessingService = new ImageProcessingService();
