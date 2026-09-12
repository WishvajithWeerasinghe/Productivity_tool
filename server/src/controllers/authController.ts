import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

function setTokenCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user.id);
  setTokenCookie(res, token);

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user.id);
  setTokenCookie(res, token);

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}
