import Course from '../models/courseModel.js';

const buildCourseFilters = (queryParams) => {
  const filters = {};
  const { search, category, level, instructor } = queryParams;

  if (category) {
    filters.category = category;
  }

  if (level) {
    filters.level = level;
  }

  if (instructor) {
    filters.instructor = instructor;
  }

  if (search) {
    filters.$text = { $search: search };
  } else if (queryParams.title) {
    filters.title = new RegExp(queryParams.title, 'i');
  }

  if (queryParams.isPublished !== undefined) {
    filters.isPublished = queryParams.isPublished === 'true';
  } else {
    filters.isPublished = true;
  }

  return filters;
};

export const getCourses = async (req, res) => {
  try {
    const filters = buildCourseFilters(req.query);
    const courses = await Course.find(filters)
      .sort({ createdAt: -1 })
      .populate('instructor', 'name email profile');

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      duration,
      modules = [],
      imageUrl,
      price,
      isPublished
    } = req.body;

    if (!title || !description || !category || !duration) {
      return res.status(400).json({ success: false, message: 'Missing required course fields' });
    }

    const course = new Course({
      title,
      description,
      category,
      level,
      duration,
      modules,
      imageUrl,
      price,
      isPublished: typeof isPublished === 'boolean' ? isPublished : false,
      instructor: req.user._id
    });

    await course.save();

    const populatedCourse = await course.populate('instructor', 'name email profile');

    res.status(201).json({ success: true, data: populatedCourse });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email profile');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!course.isPublished && !['admin', 'instructor'].includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Course not published' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const updates = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isOwner = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    Object.assign(course, updates);
    await course.save();

    const populatedCourse = await course.populate('instructor', 'name email profile');

    res.status(200).json({ success: true, data: populatedCourse });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
};

