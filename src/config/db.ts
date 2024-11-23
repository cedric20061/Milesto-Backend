import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    mongoose.set("debug", true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    mongoose.set("debug", true);
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
