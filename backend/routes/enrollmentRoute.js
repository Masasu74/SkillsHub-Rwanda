import express from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  updateProgress
} from '../controllers/enrollmentController.js';
import authMiddleware from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  enrollInCourse
);

router.get(
  '/my-courses',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  getMyEnrollments
);

router.put(
  '/progress',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  updateProgress
);

export default router;

