import type { Response } from "express";
import tryCatch from "../config/tryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { Chat } from "../model/chat.model.js";

export const createNewChat = tryCatch(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?._id;
    const { otherUserId } = req.body;
    if (!otherUserId) {
      res.status(400).json({
        message: "Receiver ID is required",
      });
      return;
    }
    const existingChat = await Chat.findOne({
      users: { $all: [currentUserId, otherUserId], $size: 2 },
    });
    console.log("existing chat", existingChat);
    if (existingChat) {
      res.json({
        message: "Chat already exists",
        chatId: existingChat._id,
      });
      return;
    }
    const newChat = await Chat.create({
      users: [currentUserId, otherUserId],
    });
    res.json({
      message: "New chat created",
      chatId: newChat._id,
    });
  }
);
