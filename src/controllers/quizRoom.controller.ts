// be/controllers/quizRoom.controller.ts
import { Request, Response } from "express";
import QuizRoom from "../models/QuizRoom";
import Attempt from "../models/Attempt";
import Question from "../models/Question";
import Quiz from "../models/Quiz";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * POST /api/v1/rooms/create
 * Lecturer/Admin creates a quiz room
 */
export const createQuizRoom = async (req: AuthRequest, res: Response) => {
  try {
    const {
      quizId,
      timeLimit,
      maxAttempts,
      startsAt,
      endsAt,
    } = req.body;

    if (!quizId || !timeLimit) {
      return res.status(400).json({ message: "Quiz and time limit are required" });
    }

    // Ensure quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Generate simple room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = await QuizRoom.create({
      quiz: quiz._id,
      lecturer: req.user!.sub,
      roomCode,
      timeLimit,
      maxAttempts: maxAttempts ?? 1,
      startsAt,
      endsAt,
      active: true,
    });

    return res.status(201).json({ data: room });
  } catch (err) {
    console.error("createQuizRoom error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

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

/**
 * GET /api/v1/rooms/:roomId
 * Student / Lecturer view room details
 */
export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const room = await QuizRoom.findById(req.params.roomId).populate({
      path: "quiz",
      populate: { path: "questions" },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json({ data: room });
  } catch (err) {
    console.error("getRoomById error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/v1/rooms/join
 * Student joins a room using roomCode
 */
export const joinRoomByCode = async (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({ message: "Room code is required" });
    }

    const room = await QuizRoom.findOne({
      roomCode: roomCode.toUpperCase(),
      active: true,
    });

    if (!room) {
      return res.status(404).json({ message: "Invalid or inactive room code" });
    }

    return res.json({
      data: {
        roomId: room._id,
      },
    });
  } catch (err) {
    console.error("joinRoomByCode error", err);
    return res.status(500).json({ message: "Server error" });
  }
};
