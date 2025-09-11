import { Router } from "express";
import {
  getAllUser,
  getAUser,
  loginUser,
  myProfile,
  updateName,
  verifyUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const userRouter: Router = Router();

userRouter.post("/login", loginUser);
userRouter.post("/verify", verifyUser);
userRouter.get("/my-profile", isAuth, myProfile);
userRouter.get("/user/all", isAuth, getAllUser);
userRouter.post("/update/user", isAuth, updateName);
userRouter.get("/user/:id", getAUser);

export default userRouter;
