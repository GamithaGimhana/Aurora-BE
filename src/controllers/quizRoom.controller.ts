// be/controllers/quizRoom.controller.ts
import { Request, Response } from "express";
import QuizRoom from "../models/QuizRoom";
import Attempt from "../models/Attempt";
import Quiz from "../models/Quiz";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Role } from "../models/User";

const generateRoomCode = async (): Promise<string> => {
  let code: string;
  let exists: boolean;

  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = !!(await QuizRoom.exists({ roomCode: code }));
  } while (exists);

  return code;
};

export const createQuizRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, timeLimit, maxAttempts, startsAt, endsAt } = req.body;

    if (!quizId || !timeLimit) {
      return res.status(400).json({ message: "Quiz and time limit are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let room;
    let attempts = 0;
    const MAX_RETRIES = 5;

    while (!room && attempts < MAX_RETRIES) {
      try {
        const roomCode = await generateRoomCode();

        room = await QuizRoom.create({
          quiz: quiz._id,
          lecturer: req.user!.sub,
          roomCode,
          timeLimit,
          maxAttempts: maxAttempts ?? 1,
          startsAt,
          endsAt,
          active: true,
        });

      } catch (err: any) {
        if (err.code === 11000) {
          attempts++;
          continue; // retry with new code
        }
        throw err;
      }
    }

    if (!room) {
      return res.status(500).json({ message: "Could not generate unique room code" });
    }

    return res.status(201).json({ data: room });

  } catch (err) {
    console.error("createQuizRoom error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

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

    const existing = await Attempt.findOne({ student: userId, quizRoom: roomId });

    if (existing) {
      return res.json(existing); // resume on refresh
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

/**
 * PATCH /api/v1/rooms/:roomId/toggle
 * Lock / unlock a quiz room
 */
export const toggleRoomActive = async (req: AuthRequest, res: Response) => {
  try {
    const room = await QuizRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Only owner lecturer can toggle
    if ( room.lecturer.toString() !== req.user!.sub && !req.user!.role.includes(Role.ADMIN)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    room.active = !room.active;
    await room.save();

    return res.json({
      message: `Room ${room.active ? "unlocked" : "locked"}`,
      active: room.active,
    });
  } catch (err) {
    console.error("toggleRoomActive error", err);
    return res.status(500).json({ message: "Server error" });
  }
};
