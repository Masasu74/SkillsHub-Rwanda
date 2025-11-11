import express from 'express';
import {
  getCertificate,
  getCourseProgress,
  markModuleComplete,
  completePracticeItem,
  submitQuiz
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

router.put(
  '/practice-complete',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  completePracticeItem
);

router.post(
  '/quiz',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  submitQuiz
);

router.get(
  '/:courseId/certificate',
  authMiddleware,
  authorize(['student', 'instructor', 'admin']),
  getCertificate
);

export default router;

