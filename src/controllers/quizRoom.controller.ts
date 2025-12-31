// be/controllers/quizRoom.controller.ts
import { Request, Response } from "express";
import QuizRoom from "../models/QuizRoom";
import Attempt from "../models/Attempt";
import Question from "../models/Question";
import Quiz from "../models/Quiz";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * POST /api/v1/rooms/:roomId/start
 * Creates a new Attempt for the authenticated student and returns:
 * { attempt, quiz, endsAt }
 */
export const startQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.sub;

    const room = await QuizRoom.findById(roomId).populate({
      path: "quiz",
      populate: { path: "questions" },
    });

    if (!room || !room.active) {
      return res.status(404).json({ message: "Room not found or inactive" });
    }

    // If startsAt / endsAt logic exists, enforce it
    if (room.startsAt && new Date() < new Date(room.startsAt)) {
      return res.status(400).json({ message: "Quiz has not started yet" });
    }
    if (room.endsAt && new Date() > new Date(room.endsAt)) {
      return res.status(400).json({ message: "Quiz has already ended" });
    }

    // check attempts count
    const prevAttempts = await Attempt.countDocuments({
      quizRoom: room._id,
      student: userId,
    });

    if (room.maxAttempts && prevAttempts >= room.maxAttempts) {
      return res.status(400).json({ message: "Maximum attempts reached" });
    }

    // Create the attempt record (empty responses initially)
    const attempt = await Attempt.create({
      quizRoom: room._id,
      student: userId,
      attemptNumber: prevAttempts + 1,
      responses: [],
      score: 0,
    });

    const endsAt = room.timeLimit
      ? new Date(Date.now() + room.timeLimit * 60_000)
      : null;

    // Return structured payload frontend expects
    return res.json({ attempt, quiz: room.quiz, endsAt });
  } catch (err) {
    console.error("startQuiz error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyRooms = async (req: AuthRequest, res: Response) => {
  const rooms = await QuizRoom.find({ lecturer: req.user!.sub });
  res.json({ data: rooms });
};
