import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'in-progress'
    },
    completedAt: {
      type: Date
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

progressEntrySchema.index({ student: 1, course: 1, module: 1 }, { unique: true });
progressEntrySchema.index({ status: 1, updatedAt: -1 });

export default mongoose.models.ProgressEntry || mongoose.model('ProgressEntry', progressEntrySchema);

