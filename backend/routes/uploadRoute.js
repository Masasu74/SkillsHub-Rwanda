import express from 'express';
import multer from 'multer';
import { createUploadSignature, uploadFile } from '../controllers/uploadController.js';
import authMiddleware from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

router.post(
  '/signature',
  authMiddleware,
  authorize(['instructor', 'admin']),
  createUploadSignature
);

router.post(
  '/file',
  authMiddleware,
  authorize(['instructor', 'admin']),
  upload.single('file'),
  uploadFile
);

export default router;

