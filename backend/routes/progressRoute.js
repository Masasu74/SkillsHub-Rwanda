import express from 'express';
import {
  getCourseProgress,
  markModuleComplete
} from '../controllers/progressController.js';
import authMiddleware from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.get(
  '/:courseId',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  getCourseProgress
);

router.put(
  '/module-complete',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  markModuleComplete
);

export default router;

