import type { Request, RequestHandler, Response } from "express";
import tryCatch from "../config/tryCatch.js";
import { redisClient } from "../config/redis.js";
import { publishToQueue } from "../config/rabbitMQ.js";
import User from "../model/User.js";
import generateToken from "../config/generateToken.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";

export const loginUser: RequestHandler = tryCatch(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
      return res.status(429).json({
        message:
          "Too many requests. Please wait a few minutes before requesting a new OTP.",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
      EX: 300,
    });
    await redisClient.set(rateLimitKey, "true", {
      EX: 60,
    });
    const message = {
      to: email,
      subject: "Your Login OTP",
      body: `Your One-Time Password (OTP) is ${otp}. It is valid for 5 minutes. If you did not request this, please ignore this email.`,
    };
    await publishToQueue("send_otp_queue", message);
    res.status(200).json({
      success: true,
      message:
        "A one-time password (OTP) has been sent to your email address. Please check your inbox and follow the instructions to continue.",
      email,
      expiresIn: 300, // seconds
    });
  }
);

export const verifyUser = async (req: Request, res: Response) => {
  const { email, otp: receivedOtp } = req.body;
  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp || receivedOtp !== storedOtp) {
    return res.status(400).json({
      message: "Invalid or expired OTP. Please try again.",
    });
  }
  let user = await User.findOne({ email });
  if (!user) {
    const name = email.split("@")[0];
    user = await User.create({ email, name });
  }
  const token = generateToken(user);
  return res.status(200).json({
    message: "OTP verified successfully. You are now logged in.",
    token,
    user,
  });
};

export const myProfile = tryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    res.status(200).json({
      user,
    });
  }
);

export const updateName = tryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    user.name = req.body.name;
    await user.save();
    const token = generateToken(user);
    res.status(200).json({
      message: "User updated",
      user,
      token,
    });
  }
);

export const getAllUser = tryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find();
    res.status(200).json({
      users,
    });
  }
);

export const getAUser = tryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      user,
    });
  }
);
