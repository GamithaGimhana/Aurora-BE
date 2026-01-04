import { Request, Response, NextFunction } from "express";
import User, { Role } from "../models/User";
import Note from "../models/Note";
import Quiz from "../models/Quiz";
import QuizRoom from "../models/QuizRoom";
import { AppError } from "../utils/AppError";

// /api/v1/admin/stats
export const getSystemStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [users, notes, quizzes, rooms] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Quiz.countDocuments(),
      QuizRoom.countDocuments(),
    ]);

    res.status(200).json({
      users,
      notes,
      quizzes,
      rooms,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/admin/users
export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

// /api/v1/admin/users/:id/role
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.body;

    if (!["STUDENT", "LECTURER"].includes(role)) {
      throw new AppError("Invalid role", 400);
    }

    if (role === Role.ADMIN) {
      throw new AppError("Cannot assign ADMIN role", 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role.includes(Role.ADMIN)) {
      throw new AppError("Cannot modify ADMIN role", 403);
    }

    user.role = [role];
    await user.save();

    res.status(200).json({
      message: "Role updated",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/admin/users/:id
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role.includes(Role.ADMIN)) {
      throw new AppError("Admin account cannot be deleted", 403);
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
