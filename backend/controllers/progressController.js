import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';
import ProgressEntry from '../models/progressModel.js';

const calculateProgressPercentage = (completedCount, totalCount) => {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const progressEntries = await ProgressEntry.find({
      student: req.user._id,
      course: courseId
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        enrollment,
        course,
        progressEntries
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course progress' });
  }
};

export const markModuleComplete = async (req, res) => {
  try {
    const { courseId, moduleId, status = 'completed', timeSpentMinutes = 0, notes } = req.body;

    if (!courseId || !moduleId) {
      return res.status(400).json({ success: false, message: 'Course ID and Module ID are required' });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const moduleExists = course.modules.some((module) => module._id.toString() === moduleId);

    if (!moduleExists) {
      return res.status(404).json({ success: false, message: 'Module not found in course' });
    }

    const update = {
      status,
      lastAccessedAt: new Date(),
      notes
    };

    if (status === 'completed') {
      update.completedAt = new Date();
    } else {
      update.completedAt = null;
    }

    if (timeSpentMinutes) {
      update.$inc = { timeSpentMinutes: timeSpentMinutes };
    }

    const progressEntry = await ProgressEntry.findOneAndUpdate(
      {
        student: req.user._id,
        course: courseId,
        module: moduleId
      },
      update,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    const completedModules = await ProgressEntry.countDocuments({
      student: req.user._id,
      course: courseId,
      status: 'completed'
    });

    const progressPercentage = calculateProgressPercentage(completedModules, course.modules.length);

    enrollment.progress = progressPercentage;
    enrollment.lastAccessed = new Date();

    if (progressEntry.status === 'completed') {
      const alreadyMarked = enrollment.completedModules.some(
        (completedModuleId) => completedModuleId.toString() === moduleId
      );
      if (!alreadyMarked) {
        enrollment.completedModules.push(moduleId);
      }
    } else {
      enrollment.completedModules = enrollment.completedModules.filter(
        (completedModuleId) => completedModuleId.toString() !== moduleId
      );
    }

    if (progressPercentage === 100) {
      enrollment.status = 'completed';
    } else if (enrollment.status === 'completed') {
      enrollment.status = 'active';
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        progressEntry,
        enrollment
      }
    });
  } catch (error) {
    console.error('Mark module complete error:', error);
    res.status(500).json({ success: false, message: 'Failed to update module progress' });
  }
};

