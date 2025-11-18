import express from 'express';
import {
  createCourse,
  deleteCourse,
  getCourseAnalytics,
  getCourseById,
  getCourseEnrollments,
  getCourses,
  getMyCourses,
  updateCourse
} from '../controllers/courseController.js';
import authMiddleware from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/my-courses', authMiddleware, authorize(['instructor', 'admin']), getMyCourses);
router.get('/:id/enrollments', authMiddleware, authorize(['instructor', 'admin']), getCourseEnrollments);
router.get('/:id/analytics', authMiddleware, authorize(['instructor', 'admin']), getCourseAnalytics);
router.get('/:id', authMiddleware, getCourseById);

router.post(
  '/',
  authMiddleware,
  authorize(['instructor', 'admin']),
  createCourse
);

router.put(
  '/:id',
  authMiddleware,
  authorize(['instructor', 'admin']),
  updateCourse
);

router.delete(
  '/:id',
  authMiddleware,
  authorize(['instructor', 'admin']),
  deleteCourse
);

export default router;

