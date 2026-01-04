import { Request, Response } from "express";
import User, { Role } from "../models/User";
import Note from "../models/Note";
import Quiz from "../models/Quiz";
import QuizRoom from "../models/QuizRoom";

export const getSystemStats = async (_req: Request, res: Response) => {
  const [users, notes, quizzes, rooms] = await Promise.all([
    User.countDocuments(),
    Note.countDocuments(),
    Quiz.countDocuments(),
    QuizRoom.countDocuments(),
  ]);

  res.json({
    users,
    notes,
    quizzes,
    rooms,
  });
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find().select("-password");
  res.json({ users });
};

// backend/src/controllers/admin.controller.ts
export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;

  if (!["STUDENT", "LECTURER"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (role === "ADMIN") {
    return res.status(400).json({ message: "Cannot assign ADMIN role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: [role] },
    { new: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "Role updated", user });
};

export const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role.includes(Role.ADMIN)) {
    return res.status(403).json({
      message: "Admin account cannot be deleted",
    });
  }

  await user.deleteOne();

  res.json({ message: "User deleted successfully" });
};
