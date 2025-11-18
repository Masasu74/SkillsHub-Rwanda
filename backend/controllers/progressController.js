import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';
import ProgressEntry from '../models/progressModel.js';

const getModuleById = (course, moduleId) =>
  course.modules.find((module) => module._id.toString() === moduleId.toString());

const countCompletedItems = (collection = [], moduleId, indexKey) =>
  collection.filter(
    (entry) =>
      entry.moduleId.toString() === moduleId.toString() && typeof entry[indexKey] === 'number'
  ).length;

const hasPassedQuiz = (quizResults = [], moduleId) =>
  quizResults.some(
    (entry) => entry.moduleId.toString() === moduleId.toString() && Boolean(entry.passed)
  );

const calculateOverallProgress = (course, enrollment) => {
  if (!course?.modules?.length || !enrollment) return enrollment?.progress ?? 0;

  let totalItems = 0;
  let completedItems = 0;

  course.modules.forEach((module) => {
    const moduleId = module._id.toString();

    totalItems += 1;
    if (
      enrollment.completedModules?.some(
        (completedId) => completedId?.toString() === moduleId
      )
    ) {
      completedItems += 1;
    }

    const exercisesCount = module.exercises?.length || 0;
    totalItems += exercisesCount;
    if (exercisesCount > 0) {
      const completedExercises = countCompletedItems(
        enrollment.completedExercises,
        moduleId,
        'exerciseIndex'
      );
      completedItems += Math.min(completedExercises, exercisesCount);
    }

    const activitiesCount = module.activities?.length || 0;
    totalItems += activitiesCount;
    if (activitiesCount > 0) {
      const completedActivities = countCompletedItems(
        enrollment.completedActivities,
        moduleId,
        'activityIndex'
      );
      completedItems += Math.min(completedActivities, activitiesCount);
    }

    const hasQuizQuestions = Array.isArray(module.quiz) && module.quiz.length > 0;
    if (hasQuizQuestions) {
      totalItems += 1;
      if (hasPassedQuiz(enrollment.quizResults, moduleId)) {
        completedItems += 1;
      }
    }
  });

  if (totalItems === 0) {
    return 0;
  }

  return Math.round((completedItems / totalItems) * 100);
};

const maybeIssueCertificate = (course, enrollment) => {
  if (!course?.modules?.length || !enrollment) {
    return false;
  }

  const allModulesComplete = course.modules.every((module) =>
    enrollment.completedModules.some(
      (completedId) => completedId?.toString() === module._id.toString()
    )
  );

  if (!allModulesComplete) return false;

  const allExercisesComplete = course.modules.every((module) => {
    const total = module.exercises?.length || 0;
    if (!total) return true;
    return (
      countCompletedItems(enrollment.completedExercises, module._id, 'exerciseIndex') >= total
    );
  });

  if (!allExercisesComplete) return false;

  const allActivitiesComplete = course.modules.every((module) => {
    const total = module.activities?.length || 0;
    if (!total) return true;
    return (
      countCompletedItems(enrollment.completedActivities, module._id, 'activityIndex') >= total
    );
  });

  if (!allActivitiesComplete) return false;

  const allQuizzesPassed = course.modules.every((module) => {
    const total = module.quiz?.length || 0;
    if (!total) return true;
    return hasPassedQuiz(enrollment.quizResults, module._id);
  });

  if (!allQuizzesPassed) return false;

  if (!enrollment.certificateIssuedAt) {
    enrollment.certificateIssuedAt = new Date();
  }

  if (!enrollment.certificateId) {
    const courseSuffix = course._id.toString().slice(-4).toUpperCase();
    const studentSuffix = enrollment.student.toString().slice(-4).toUpperCase();
    enrollment.certificateId = `SHR-${courseSuffix}${studentSuffix}-${Date.now()
      .toString(36)
      .toUpperCase()}`;
  }

  return true;
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('instructor', 'name email profile');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id
    }).populate('student', 'name email profile');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Recalculate progress to ensure accuracy
    const recalculatedProgress = calculateOverallProgress(course, enrollment);
    
    // Check if progress needs to be updated
    if (enrollment.progress !== recalculatedProgress) {
      enrollment.progress = recalculatedProgress;
      enrollment.lastAccessed = new Date();
      
      // Update status based on progress
      if (recalculatedProgress === 100 && enrollment.status !== 'completed') {
        enrollment.status = 'completed';
      } else if (recalculatedProgress < 100 && enrollment.status === 'completed') {
        enrollment.status = 'active';
      }
      
      // Check if certificate should be issued
      if (recalculatedProgress === 100 && !enrollment.certificateIssuedAt) {
        maybeIssueCertificate(course, enrollment);
      }
      
      await enrollment.save();
      // Re-populate student after save
      await enrollment.populate('student', 'name email profile');
    } else if (!enrollment.certificateIssuedAt && recalculatedProgress === 100) {
      // Progress is already 100%, but certificate might not be issued yet
      maybeIssueCertificate(course, enrollment);
      await enrollment.save();
      await enrollment.populate('student', 'name email profile');
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
    }).populate('student', 'name email profile');

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
      update.$inc
        ? { $set: { ...update }, $inc: update.$inc }
        : update,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    const progressPercentage = calculateOverallProgress(course, enrollment);

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

    let certificateIssued = false;
    if (!enrollment.certificateIssuedAt) {
      certificateIssued = maybeIssueCertificate(course, enrollment);
    }

    await enrollment.save();

    // Re-populate student after save
    await enrollment.populate('student', 'name email profile');

    res.status(200).json({
      success: true,
      data: {
        progressEntry,
        enrollment,
        certificateIssued
      }
    });
  } catch (error) {
    console.error('Mark module complete error:', error);
    res.status(500).json({ success: false, message: 'Failed to update module progress' });
  }
};

export const completePracticeItem = async (req, res) => {
  try {
    const { courseId, moduleId, itemIndex, itemType, completed = true } = req.body;

    if (!courseId || !moduleId || typeof itemIndex !== 'number') {
      return res.status(400).json({ success: false, message: 'Missing practice item details' });
    }

    if (!['exercise', 'activity'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid practice item type' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = getModuleById(course, moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const items =
      itemType === 'exercise' ? module.exercises || [] : module.activities || [];

    if (!items.length || itemIndex < 0 || itemIndex >= items.length) {
      return res.status(400).json({ success: false, message: 'Invalid practice item index' });
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id
    }).populate('student', 'name email profile');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const collectionName =
      itemType === 'exercise' ? 'completedExercises' : 'completedActivities';
    const indexKey = itemType === 'exercise' ? 'exerciseIndex' : 'activityIndex';

    const alreadyCompletedIndex = enrollment[collectionName].findIndex(
      (entry) =>
        entry.moduleId.toString() === moduleId.toString() && entry[indexKey] === itemIndex
    );

    const moduleIdString = moduleId.toString();

    if (completed && alreadyCompletedIndex === -1) {
      enrollment[collectionName].push({
        moduleId: moduleIdString,
        [indexKey]: itemIndex,
        completedAt: new Date()
      });
    } else if (!completed && alreadyCompletedIndex !== -1) {
      enrollment[collectionName].splice(alreadyCompletedIndex, 1);
    }

    enrollment.lastAccessed = new Date();
    enrollment.progress = calculateOverallProgress(course, enrollment);
    const certificateIssued = maybeIssueCertificate(course, enrollment);

    await enrollment.save();

    // Re-populate student after save
    await enrollment.populate('student', 'name email profile');

    res.status(200).json({
      success: true,
      data: {
        enrollment,
        itemType,
        itemIndex,
        completed,
        certificateIssued
      }
    });
  } catch (error) {
    console.error('Complete practice item error:', error);
    res.status(500).json({ success: false, message: 'Failed to update practice item status' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { courseId, moduleId, answers = [] } = req.body;

    if (!courseId || !moduleId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Quiz submission is incomplete' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = getModuleById(course, moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const quizQuestions = module.quiz || [];
    if (!quizQuestions.length) {
      return res.status(400).json({ success: false, message: 'This module has no quiz' });
    }

    if (answers.length !== quizQuestions.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Please answer all quiz questions' });
    }

    const normalizedAnswers = answers.map((value) =>
      typeof value === 'number' ? value : Number.parseInt(value, 10)
    );

    let score = 0;
    quizQuestions.forEach((question, index) => {
      if (normalizedAnswers[index] === question.answerIndex) {
        score += 1;
      }
    });

    const total = quizQuestions.length;
    const passThreshold = Math.ceil(total * 0.7);
    const passed = score >= passThreshold;

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id
    }).populate('student', 'name email profile');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    enrollment.quizResults = enrollment.quizResults.filter(
      (entry) => entry.moduleId.toString() !== moduleId.toString()
    );

    enrollment.quizResults.push({
      moduleId: moduleId.toString(),
      score,
      total,
      passed,
      submittedAt: new Date()
    });

    enrollment.lastAccessed = new Date();
    enrollment.progress = calculateOverallProgress(course, enrollment);
    const certificateIssued = maybeIssueCertificate(course, enrollment);

    await enrollment.save();

    // Re-populate student after save
    await enrollment.populate('student', 'name email profile');

    res.status(200).json({
      success: true,
      data: {
        enrollment,
        quizResult: {
          moduleId,
          score,
          total,
          passed
        },
        certificateIssued
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz' });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id
    }).lean();

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const certificateIssued = Boolean(enrollment.certificateIssuedAt);

    res.status(200).json({
      success: true,
      data: {
        issued: certificateIssued,
        certificateId: enrollment.certificateId || null,
        issuedAt: enrollment.certificateIssuedAt || null,
        courseTitle: course.title,
        studentId: req.user._id
      }
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificate status' });
  }
};

