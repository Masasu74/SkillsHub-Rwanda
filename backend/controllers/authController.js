import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const TOKEN_TTL = '30d';

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

export const register = async (req, res) => {
  try {
    const { name, email, password, bio, skills = [], location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: 'student',
      profile: {
        bio: bio || '',
        skills,
        location: location || ''
      }
    });

    await user.save();

    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatches = user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Failed to log in' });
  }
};

export const me = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const getInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructors' });
  }
};

export const getInstructorById = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id).select('-password');

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    res.status(200).json({ success: true, data: instructor });
  } catch (error) {
    console.error('Get instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructor' });
  }
};

export const createInstructor = async (req, res) => {
  try {
    const { name, email, password, bio, skills = [], location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const instructor = new User({
      name,
      email,
      password,
      role: 'instructor',
      profile: {
        bio: bio || '',
        skills,
        location: location || ''
      }
    });

    await instructor.save();

    res.status(201).json({
      success: true,
      data: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role,
        profile: instructor.profile
      }
    });
  } catch (error) {
    console.error('Create instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to create instructor' });
  }
};

export const updateInstructor = async (req, res) => {
  try {
    const { name, email, bio, skills = [], location, password } = req.body;
    const instructor = await User.findById(req.params.id);

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== instructor.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      instructor.email = email;
    }

    if (name) instructor.name = name;
    if (password) instructor.password = password;
    if (bio !== undefined) instructor.profile.bio = bio;
    if (skills !== undefined) instructor.profile.skills = skills;
    if (location !== undefined) instructor.profile.location = location;

    await instructor.save();

    const updatedInstructor = await User.findById(instructor._id).select('-password');

    res.status(200).json({ success: true, data: updatedInstructor });
  } catch (error) {
    console.error('Update instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to update instructor' });
  }
};

export const deleteInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    // Import Course here to avoid circular dependency issues
    const Course = (await import('../models/courseModel.js')).default;
    const Enrollment = (await import('../models/enrollmentModel.js')).default;

    // Delete all courses created by this instructor
    const courses = await Course.find({ instructor: instructor._id });
    const courseIds = courses.map((c) => c._id);

    // Delete all enrollments for these courses
    await Enrollment.deleteMany({ course: { $in: courseIds } });

    // Delete all courses
    await Course.deleteMany({ instructor: instructor._id });

    // Delete the instructor
    await User.findByIdAndDelete(instructor._id);

    res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Delete instructor error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete instructor' });
  }
};

