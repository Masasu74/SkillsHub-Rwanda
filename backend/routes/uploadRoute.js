import express from 'express';
import { createUploadSignature } from '../controllers/uploadController.js';
import authMiddleware from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.post(
  '/signature',
  authMiddleware,
  authorize(['instructor', 'admin']),
  createUploadSignature
);

export default router;

