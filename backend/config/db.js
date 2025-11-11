import mongoose from 'mongoose';

const DEFAULT_URI =
  'mongodb+srv://masasu74:salomon123!@creditjambo.fad5qrn.mongodb.net/?appName=creditjambo';

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