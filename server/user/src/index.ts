import express from "express";
import "dotenv/config";
import connectDB from "./config/dbConnect.js";
import redisConnect from "./config/redisConnect.js";
import userRouter from "./routes/user.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use("/api/user", userRouter);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(process.env.MONGO_URI!);
  redisConnect(process.env.REDIS_URL!);
});
