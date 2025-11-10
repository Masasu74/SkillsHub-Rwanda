import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/skillshub_rwanda';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || DEFAULT_URI;

  try {
    await mongoose.connect(uri, {
      autoIndex: true
    });

    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};