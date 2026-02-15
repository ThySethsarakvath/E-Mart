/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `emart/${folder}`,
          resource_type: 'image',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Upload failed: No result returned'));
          }
          resolve(result);
        },
      );

      // Convert buffer to stream
      const { Readable } = require('stream');
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  }

  // Extract public_id from Cloudinary URL
  extractPublicId(url: string): string | null {
    if (!url) return null;

    // Example URL: https://res.cloudinary.com/REMOVED_SECRET/image/upload/v1234567890/emart/banners/filename.jpg
    const match = url.match(/\/emart\/[^/]+\/[^.]+/);
    return match ? match[0].substring(1) : null; // Remove leading slash
  }
}
