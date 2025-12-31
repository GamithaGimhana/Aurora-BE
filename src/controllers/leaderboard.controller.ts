import { Request, Response } from "express";
import Attempt from "../models/Attempt";

/**
 * GET LEADERBOARD
 * GET /api/v1/attempts/leaderboard/:roomId
 */
export const getLeaderboard = async (req: Request, res: Response) => {
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
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
