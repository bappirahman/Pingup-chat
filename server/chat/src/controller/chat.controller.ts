import type { Response } from "express";
import tryCatch from "../config/tryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { Chat } from "../model/chat.model.js";
import { Message } from "../model/message.model.js";
import axios from "axios";
import mongoose from "mongoose";

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
    return;
  }
);

export const getAllChats = tryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }
    const chats = await Chat.find({
      users: userId,
    }).sort({ updatedAt: -1 });

    const chatWithUserData = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id !== userId);
        try {
          const unseenCount = await Message.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false,
          });
          const { data, statusText } = await axios.get(
            `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
          );
          if (statusText !== "OK") {
            throw new Error("Failed to fetch other user data");
          }
          return {
            user: data.user,
            chat: {
              ...chat.toObject(),
              latestMessage: chat.latestMessage || null,
              unseenCount,
            },
          };
        } catch (error) {
          if (error instanceof Error) {
            console.error(
              "Failed to fetch user data or count unseen messages:",
              error.message
            );
          } else {
            console.error(
              "Failed to fetch user data or count unseen messages:",
              error
            );
          }
          return null;
        }
      })
    );
    res.json({
      chats: chatWithUserData,
    });
  }
);

export const sendMessage = tryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;
    if (!senderId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }
    if (!chatId) {
      res.status(400).json({
        message: "ChatId is required",
      });
      return;
    }

    if (!text && !imageFile) {
      res.status(400).json({
        message: "Message text or image file is required",
      });
      return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({
        message: "Chat not found. Please ensure the chat ID is correct.",
      });
      return;
    }
    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === senderId?.toString()
    );
    if (!isUserInChat) {
      res.status(403).json({
        message: "You are not authorized to send messages in this chat.",
      });
    }
    const otherUserId = chat.users.some(
      (userId) => userId.toString() !== senderId?.toString()
    );
    if (!otherUserId) {
      res.status(401).json({
        message: "Unable to identify the recipient user in this chat.",
      });
    }

    // TODO: setup socket

    const messageData: any = {
      chatId,
      sender: senderId,
      seen: false,
      seenAt: null,
    };

    if (imageFile) {
      messageData.image = {
        url: imageFile.path,
        publicId: imageFile.filename,
      };
      messageData.messageType = "image";
      messageData.text = text || "";
    } else {
      messageData.text = text;
      messageData.messageType = "text";
    }
    const message = new Message(messageData);
    const savedMessage = await message.save();
    const latestMessageText = imageFile ? "image" : text;
    await Chat.findByIdAndUpdate(
      chatId,
      {
        latestMessage: {
          text: latestMessageText,
          sender: senderId,
        },
        updatedAt: new Date(),
      },
      { new: true }
    );
    // TODO: emit to sockets

    res.status(201).json({
      message: savedMessage,
      sender: senderId,
    });
  }
);

export const getMessagesByChat = tryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { chatId } = req.params;
    if (!chatId) {
      res.status(400).json({
        message: "ChatId is required",
      });
      return;
    }
    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({
        message: "Chat not found",
      });
      return;
    }
    const isUserInChat = chat.users.some(
      (id) => id.toString() === userId.toString()
    );
    if (!isUserInChat) {
      res.status(401).json({
        message: "You are not a participant in the chat",
      });
      return;
    }
    const messagesToMarkSeen = await Message.find({
      chatId,
      sender: { $ne: userId },
      seen: false,
    });
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    const otherUserId = chat.users.find(
      (id) => id.toString() !== userId.toString()
    );
    if (!otherUserId) {
      res.status(400).json({
        message: "No other user",
      });
      return;
    }
    try {
      const { data, statusText } = await axios.get(
        `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
      );
      if (statusText !== "OK") {
        throw new Error("Failed to fetch other user data");
      }

      // TODO: socket
      res.json({
        messages,
        user: data.user,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to fetch user data:", error.message);
      } else {
        console.error(
          "An unknown error occurred while fetching user data:",
          error
        );
      }
      res.json({
        messages,
        user: { _id: otherUserId, name: "Unknown user" },
      });
    }
  }
);
