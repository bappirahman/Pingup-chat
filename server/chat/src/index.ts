import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import chatRouter from "./routes/chat.js";
import { app, server } from "./config/socket.js";

app.use(express.json());
app.use(cors());
app.use("/api/v1", chatRouter);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  connectDB(process.env.MONGO_URI as string);
  console.log(`Server is runnign on port ${PORT}`);
});
