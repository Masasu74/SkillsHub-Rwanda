import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);

    if (!course || (!course.isPublished && req.user.role === 'student')) {
      return res.status(404).json({ success: false, message: 'Course not available' });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(200).json({ success: true, data: existingEnrollment });
    }

    const enrollment = new Enrollment({
      student: req.user._id,
      course: courseId
    });

    await enrollment.save();

    const populatedEnrollment = await enrollment
      .populate('course')
      .populate('student', 'name email profile');

    res.status(201).json({ success: true, data: populatedEnrollment });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll in course' });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email profile' }
      });

    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { courseId, progress, moduleId, completed } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (typeof progress === 'number') {
      enrollment.progress = Math.min(100, Math.max(0, progress));
    }

    if (moduleId) {
      const moduleObjectId = typeof moduleId === 'string' ? moduleId : moduleId.toString();
      const alreadyCompleted = enrollment.completedModules.some(
        (completedModuleId) => completedModuleId.toString() === moduleObjectId
      );

      if (completed && !alreadyCompleted) {
        enrollment.completedModules.push(moduleObjectId);
      } else if (!completed && alreadyCompleted) {
        enrollment.completedModules = enrollment.completedModules.filter(
          (completedModuleId) => completedModuleId.toString() !== moduleObjectId
        );
      }
    }

    enrollment.lastAccessed = new Date();

    if (enrollment.progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
    } else if (enrollment.status === 'completed' && enrollment.progress < 100) {
      enrollment.status = 'active';
    }

    await enrollment.save();

    const populatedEnrollment = await enrollment
      .populate('course')
      .populate('student', 'name email profile');

    res.status(200).json({ success: true, data: populatedEnrollment });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
};

