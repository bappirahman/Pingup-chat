import express, { type Request, type Response } from "express";
import "dotenv/config";
import cors from "cors";

import redisConnect from "./config/redis.js";
import userRouter from "./routes/user.js";
import connectDB from "./config/db.js";
import connectRabbitMQ from "./config/rabbitMQ.js";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/", userRouter);

try {
  const mongoConnected = await connectDB(process.env.MONGO_URI!);
  const redisClient = await redisConnect(process.env.REDIS_URL!);
  const RabbitMQConnected = await connectRabbitMQ({
    host: process.env.RABBITMQ_HOST!,
    port: process.env.RABBITMQ_PORT!,
    username: process.env.RABBITMQ_USERNAME!,
    password: process.env.RABBITMQ_PASSWORD!,
  });
  if (
    mongoConnected &&
    redisClient &&
    Object.keys(redisClient).length > 0 &&
    RabbitMQConnected
  ) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
} catch (error) {
  console.error("Error connecting:", error);
}
