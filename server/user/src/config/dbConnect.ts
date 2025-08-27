import mongoose from "mongoose";

const connectDB = async (mongoURI: string) => {
  try {
    await mongoose.connect(mongoURI, {
      dbName: process.env.DB_NAME || "pingup_chatapp",
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
