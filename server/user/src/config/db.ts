import mongoose from "mongoose";

const connectDB = async (mongoURI: string) => {
  try {
    const connection = await mongoose.connect(mongoURI, {
      dbName: process.env.DB_NAME || "pingup_chatapp",
    });
    if (connection) {
      console.log("MongoDB connected");
      return true;
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
