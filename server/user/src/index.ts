import express from "express";
import "dotenv/config";

import redisConnect from "./config/redis.js";
import userRouter from "./routes/user.js";
import connectDB from "./config/db.js";
import connectRabbitMQ from "./config/rabbitMQ.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use("/api/user", userRouter);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

try {
  const mongoConnected = await connectDB(process.env.MONGO_URI!);
  const redisConnected = await redisConnect(process.env.REDIS_URL!);
  const RabbitMQConnected = await connectRabbitMQ({
    host: process.env.RABBITMQ_HOST!,
    port: process.env.RABBITMQ_PORT!,
    username: process.env.RABBITMQ_USERNAME!,
    password: process.env.RABBITMQ_PASSWORD!,
  });
  if (mongoConnected && redisConnected && RabbitMQConnected) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
} catch (error) {
  console.error("Error connecting:", error);
}
