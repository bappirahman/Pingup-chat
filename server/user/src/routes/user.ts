import { Router } from "express";

const userRouter: Router = Router();

userRouter.get("/", (req, res) => {
  res.send("User route");
});

export default userRouter;
