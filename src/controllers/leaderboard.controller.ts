import { Request, Response, NextFunction } from "express";
import Attempt from "../models/Attempt";
import { AppError } from "../utils/AppError";

// /api/v1/attempts/leaderboard/:roomId
export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;

    const leaderboard = await Attempt.find({
      quizRoom: roomId,
      submittedAt: { $ne: null },
    })
      .populate("student", "name email")
      .sort({ score: -1, submittedAt: 1 });

    res.status(200).json({
      message: "Leaderboard fetched",
      data: leaderboard,
    });
  } catch (err) {
    next(err instanceof AppError ? err : err);
  }
};
