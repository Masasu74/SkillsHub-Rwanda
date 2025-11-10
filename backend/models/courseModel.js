import mongoose from 'mongoose';

const courseModuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    resources: [{ type: String, trim: true }]
  },
  {
    _id: true,
    timestamps: true
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['technology', 'business', 'hospitality'],
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    duration: { type: Number, required: true, min: 0 },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    modules: {
      type: [courseModuleSchema],
      default: []
    },
    imageUrl: { type: String, default: '' },
    price: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ title: 'text', description: 'text', 'modules.title': 'text' });
courseSchema.index({ category: 1, level: 1, isPublished: 1 });
courseSchema.index({ instructor: 1, createdAt: -1 });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);

