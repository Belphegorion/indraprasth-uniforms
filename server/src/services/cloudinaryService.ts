import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';
import path from 'path';
import fs from 'fs';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

export const uploadImageStream = async (
  fileBuffer: Buffer,
  filename = 'product'
): Promise<CloudinaryUploadResult> => {
  // If no credentials configured, generate a mock or safe fallback during local offline testing
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    const mockId = `indraprasth/products/local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const base64 = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    return {
      url: base64,
      publicId: mockId,
    };
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'indraprasth/products',
        resource_type: 'image',
        public_id: `${filename.replace(/\.[^/.]+$/, '')}_${Date.now()}`,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty result'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    upload.end(fileBuffer);
  });
};

export const uploadVideoStream = async (
  fileBuffer: Buffer,
  filename = 'hero-video'
): Promise<CloudinaryUploadResult> => {
  // If no credentials configured, write locally to uploads directory or client public folder
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    const ext = path.extname(filename) || '.mp4';
    const sanitizedBase = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFilename = `${sanitizedBase}_${Date.now()}${ext}`;

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const targetPath = path.join(UPLOADS_DIR, safeFilename);
    fs.writeFileSync(targetPath, fileBuffer);

    // Also mirror to client/public/uploads if it exists for local Vite dev convenience
    const clientUploads = path.resolve(__dirname, '../../../client/public/uploads');
    try {
      if (!fs.existsSync(clientUploads)) {
        fs.mkdirSync(clientUploads, { recursive: true });
      }
      fs.writeFileSync(path.join(clientUploads, safeFilename), fileBuffer);
    } catch {
      // Non-fatal
    }

    return {
      url: `/uploads/${safeFilename}`,
      publicId: `local_${safeFilename}`,
    };
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'indraprasth/videos',
        resource_type: 'video',
        public_id: `${filename.replace(/\.[^/.]+$/, '')}_${Date.now()}`,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary video upload returned empty result'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    upload.end(fileBuffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return;
  }
  await cloudinary.uploader.destroy(publicId);
};

export const deleteVideo = async (publicId: string): Promise<void> => {
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    if (publicId.startsWith('local_')) {
      const filename = path.basename(publicId.replace('local_', ''));
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
      const clientUploads = path.resolve(__dirname, '../../../client/public/uploads');
      const clientPath = path.join(clientUploads, filename);
      if (fs.existsSync(clientPath)) {
        try {
          fs.unlinkSync(clientPath);
        } catch {}
      }
    }
    return;
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
};
