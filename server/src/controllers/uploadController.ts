import { Request, Response } from 'express';
import { uploadImageStream, deleteImage } from '../services/cloudinaryService';

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No image file uploaded' });
    return;
  }

  try {
    const result = await uploadImageStream(req.file.buffer, req.file.originalname);
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Image upload failed',
    });
  }
};

export const deleteProductImage = async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.publicId || (req.params as any)[0] || (req.query.publicId as string);
  if (!rawId) {
    res.status(400).json({ success: false, error: 'publicId is required' });
    return;
  }

  const publicId = String(rawId).replace(/^\/+/, '');

  try {
    // Cloudinary publicIds may contain slashes, which should be properly decoded
    const decodedId = decodeURIComponent(publicId);
    await deleteImage(decodedId);
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Image deletion failed',
    });
  }
};
