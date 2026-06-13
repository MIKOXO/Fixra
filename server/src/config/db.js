import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log(
      colors.cyan('MONGODB_URI not set, skipping database connection'),
    );
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(colors.green('MongoDB connected'));
  } catch (error) {
    console.error(colors.red(`MongoDB connection failed: ${error.message}`));
    throw error;
  }
};

export default connectDB;
