import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/User.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authorization header missing or malformed",
      });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        message: "Token missing from authorization header",
      });
      return;
    }
    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    console.log("decodedValue", decodedValue);
    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Invalid token or user information not found",
      });
      return;
    }
    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Token verification failed - JWT error",
    });
    return;
  }
};
