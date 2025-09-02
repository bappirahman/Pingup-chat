import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";

const app = express();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDB(process.env.MONGO_URI as string);
  console.log(`Server is runnign on port ${PORT}`);
});
