import jwt from "jsonwebtoken";
import type { IUser } from "../model/User.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
const generateToken = (user: IUser) => {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: "15d" });
};

export default generateToken;
