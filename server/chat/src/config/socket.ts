import { Server, Socket } from "socket.io";
import http from "http";
import express, { type Express } from "express";

export const app: Express = express();

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const userSocketMap: Record<string, string> = {};
io.on("connection", (socket: Socket) => {
  console.log("user is connected", socket.id);
});
export const server = http.createServer(app);
