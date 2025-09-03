import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createNewChat,
  getAllChats,
  getMessagesByChat,
  sendMessage,
} from "../controller/chat.controller.js";
import { upload } from "../middleware/multer.js";

const chatRouter: Router = Router();

chatRouter.post("/chat/new", isAuth, createNewChat);
chatRouter.get("/chat/all", isAuth, getAllChats);
chatRouter.post("/message", isAuth, upload.single("image"), sendMessage);
chatRouter.get("/message/:chatId", isAuth, getMessagesByChat);

export default chatRouter;
