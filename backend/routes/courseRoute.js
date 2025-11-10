import express from 'express';
import {
  createCourse,
  getCourseById,
  getCourses,
  updateCourse
} from '../controllers/courseController.js';
import authMiddleware from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', getCourses);
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

export default router;

