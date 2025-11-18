import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';

// Import progress calculation helper
const calculateOverallProgress = (course, enrollment) => {
  if (!course?.modules?.length || !enrollment) return enrollment?.progress ?? 0;

  let totalItems = 0;
  let completedItems = 0;

  course.modules.forEach((module) => {
    const moduleId = module._id.toString();

    // Count module completion
    totalItems += 1;
    if (
      enrollment.completedModules?.some(
        (completedId) => completedId?.toString() === moduleId
      )
    ) {
      completedItems += 1;
    }

    // Count exercises
    const exercisesCount = module.exercises?.length || 0;
    totalItems += exercisesCount;
    if (exercisesCount > 0) {
      const completedExercises = enrollment.completedExercises?.filter(
        (entry) =>
          entry.moduleId?.toString() === moduleId && typeof entry.exerciseIndex === 'number'
      ).length || 0;
      completedItems += Math.min(completedExercises, exercisesCount);
    }

    // Count activities
    const activitiesCount = module.activities?.length || 0;
    totalItems += activitiesCount;
    if (activitiesCount > 0) {
      const completedActivities = enrollment.completedActivities?.filter(
        (entry) =>
          entry.moduleId?.toString() === moduleId && typeof entry.activityIndex === 'number'
      ).length || 0;
      completedItems += Math.min(completedActivities, activitiesCount);
    }

    // Count quiz
    const hasQuizQuestions = Array.isArray(module.quiz) && module.quiz.length > 0;
    if (hasQuizQuestions) {
      totalItems += 1;
      const hasPassed = enrollment.quizResults?.some(
        (entry) => entry.moduleId?.toString() === moduleId && Boolean(entry.passed)
      );
      if (hasPassed) {
        completedItems += 1;
      }
    }
  });

  if (totalItems === 0) {
    return 0;
  }

  return Math.round((completedItems / totalItems) * 100);
};

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    // Validate course exists and is accessible
    const course = await Course.findById(courseId).populate('instructor', 'name email profile');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!course.isPublished && req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'This course is not yet published' });
    }

    // Check for existing enrollment
    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    }).populate([
      {
        path: 'course',
        populate: { path: 'instructor', select: 'name email profile' }
      },
      { path: 'student', select: 'name email profile' }
    ]);

    if (enrollment) {
      // Recalculate progress for existing enrollment
      const recalculatedProgress = calculateOverallProgress(course, enrollment);
      if (enrollment.progress !== recalculatedProgress) {
        enrollment.progress = recalculatedProgress;
        enrollment.lastAccessed = new Date();
        
        if (recalculatedProgress === 100 && enrollment.status !== 'completed') {
          enrollment.status = 'completed';
        } else if (recalculatedProgress < 100 && enrollment.status === 'completed') {
          enrollment.status = 'active';
        }
        
        await enrollment.save();
        await enrollment.populate([
          {
            path: 'course',
            populate: { path: 'instructor', select: 'name email profile' }
          },
          { path: 'student', select: 'name email profile' }
        ]);
      }
      return res.status(200).json({ success: true, data: enrollment });
    }

    // Create new enrollment
    enrollment = new Enrollment({
      student: req.user._id,
      course: courseId,
      progress: 0,
      status: 'active',
      lastAccessed: new Date()
    });

    await enrollment.save();

    await enrollment.populate([
      {
        path: 'course',
        populate: { path: 'instructor', select: 'name email profile' }
      },
      { path: 'student', select: 'name email profile' }
    ]);

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll in course' });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .sort({ lastAccessed: -1, createdAt: -1 })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email profile' }
      })
      .populate('student', 'name email profile');

    // Recalculate progress for all enrollments to ensure accuracy
    const enrollmentsWithRecalculatedProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (enrollment.course && typeof enrollment.course !== 'string') {
          const course = await Course.findById(enrollment.course._id || enrollment.course);
          if (course) {
            const recalculatedProgress = calculateOverallProgress(course, enrollment);
            
            // Only update if progress has changed significantly (more than 1% difference)
            if (Math.abs(enrollment.progress - recalculatedProgress) > 1) {
              enrollment.progress = recalculatedProgress;
              
              // Update status based on progress
              if (recalculatedProgress === 100 && enrollment.status !== 'completed') {
                enrollment.status = 'completed';
              } else if (recalculatedProgress < 100 && enrollment.status === 'completed') {
                enrollment.status = 'active';
              }
              
              await enrollment.save();
            }
          }
        }
        return enrollment;
      })
    );

    res.status(200).json({ success: true, data: enrollmentsWithRecalculatedProgress });
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

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    }).populate('student', 'name email profile');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Manual progress override (if provided)
    if (typeof progress === 'number') {
      enrollment.progress = Math.min(100, Math.max(0, progress));
    }

    // Module completion tracking
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

    // Recalculate progress based on all completed items (more accurate)
    const recalculatedProgress = calculateOverallProgress(course, enrollment);
    enrollment.progress = recalculatedProgress;
    enrollment.lastAccessed = new Date();

    // Update status based on recalculated progress
    if (recalculatedProgress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
    } else if (recalculatedProgress < 100 && enrollment.status === 'completed') {
      enrollment.status = 'active';
    }

    await enrollment.save();

    const populatedEnrollment = await enrollment
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name email profile' }
      })
      .populate('student', 'name email profile');

    res.status(200).json({ success: true, data: populatedEnrollment });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
};

