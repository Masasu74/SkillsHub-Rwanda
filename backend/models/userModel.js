import crypto from 'crypto';
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    bio: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    location: { type: String, trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student'
    },
    profile: {
      type: profileSchema,
      default: () => ({})
    },
    enrollmentDate: { type: Date, default: Date.now },
    avatarUrl: { type: String, default: null },
    lastLogin: Date,
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const hash = crypto.createHash('sha512');
  hash.update(this.password);
  this.password = hash.digest('hex');
  next();
});

userSchema.methods.comparePassword = function comparePassword(enteredPassword) {
  const hash = crypto.createHash('sha512');
  hash.update(enteredPassword);
  const enteredHash = hash.digest('hex');
  return enteredHash === this.password;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
