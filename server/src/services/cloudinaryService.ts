import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

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

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return;
  }
  await cloudinary.uploader.destroy(publicId);
};
