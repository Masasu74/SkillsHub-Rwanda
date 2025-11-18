import express from 'express';
import {
  login,
  me,
  register,
  createInstructor,
  deleteInstructor,
  getInstructorById,
  getInstructors,
  updateInstructor
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.get('/instructors', authMiddleware, authorize(['admin']), getInstructors);
router.get('/instructors/:id', authMiddleware, authorize(['admin']), getInstructorById);
router.post('/instructors', authMiddleware, authorize(['admin']), createInstructor);
router.put('/instructors/:id', authMiddleware, authorize(['admin']), updateInstructor);
router.delete('/instructors/:id', authMiddleware, authorize(['admin']), deleteInstructor);

export default router;

