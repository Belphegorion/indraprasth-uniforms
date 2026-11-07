import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter,
}).single('image');

export const uploadCsvFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
}).single('file');

const videoFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  const hasValidExt = /\.(mp4|webm|ogg|mov)$/i.test(file.originalname);
  const hasValidMime =
    allowedMimeTypes.includes(file.mimetype) ||
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'application/octet-stream';

  // Do not allow executable or scripts
  const isDangerousMime = /executable|dos-download|x-sh|javascript|html/i.test(file.mimetype);

  if (hasValidExt && hasValidMime && !isDangerousMime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WebM, OGG, and MOV videos are allowed.'));
  }
};

const videoMulter = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
  fileFilter: videoFileFilter,
});

export const uploadSingleVideo = (req: Request, res: any, next: any): void => {
  videoMulter.fields([
    { name: 'video', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err: any) => {
    if (err) return next(err);
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      req.file = files['video']?.[0] || files['file']?.[0];
    }
    next();
  });
};
