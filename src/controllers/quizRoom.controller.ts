// be/controllers/quizRoom.controller.ts
import { Request, Response } from "express";
import QuizRoom from "../models/QuizRoom";
import Attempt from "../models/Attempt";
import Quiz from "../models/Quiz";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Role } from "../models/User";
import mongoose from "mongoose";

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
    const {
      quizId,
      timeLimit,
      maxAttempts,
      startsAt,
      endsAt,
      visibility = "PUBLIC",
    } = req.body;

    if (!quizId || !timeLimit) {
      return res.status(400).json({ message: "Quiz and time limit are required" });
    }

    if (!["PUBLIC", "PRIVATE"].includes(visibility)) {
      return res.status(400).json({ message: "Invalid visibility" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let room;
    let attempts = 0;

    while (!room && attempts < 5) {
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
          visibility,
          active: true,
        });
      } catch (err: any) {
        if (err.code === 11000) {
          attempts++;
          continue;
        }
        throw err;
      }
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

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.active) {
      return res.status(403).json({ message: "Room is locked" });
    }

    const now = new Date();

    if (room.startsAt && now < room.startsAt) {
      return res.status(403).json({ message: "Quiz has not started yet" });
    }

    if (room.endsAt && now > room.endsAt) {
      return res.status(403).json({ message: "Quiz has ended" });
    }

    const totalAttempts = await Attempt.countDocuments({
      quizRoom: room._id,
      student: userId,
    });

    if (room.maxAttempts && totalAttempts >= room.maxAttempts) {
      return res.status(403).json({
        message: "Attempt limit reached",
      });
    }

    // Resume ONLY if there is an unfinished attempt
    const existingAttempt = await Attempt.findOne({
      quizRoom: room._id,
      student: userId,
      submittedAt: null,
    });

    if (existingAttempt) {
      return res.json({
        attempt: existingAttempt,
        quiz: room.quiz,
      });
    }

    const attempt = await Attempt.create({
      quizRoom: room._id,
      student: userId,
      attemptNumber: totalAttempts + 1,
      score: 0,
    });

    const endsAt = room.timeLimit
      ? new Date(Date.now() + room.timeLimit * 60_000)
      : null;

    return res.json({
      attempt,
      quiz: room.quiz,
      endsAt,
    });

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
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    const room = await QuizRoom.findById(roomId).populate({
      path: "quiz",
      populate: { path: "questions" },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (
      room.visibility === "PRIVATE" &&
      room.lecturer.toString() !== req.user!.sub &&
      !req.user!.role.includes(Role.ADMIN)
    ) {
      return res.status(403).json({ message: "Private room" });
    }

    const now = new Date();

    if (
      req.user!.role.includes(Role.STUDENT) &&
      (
        (room.startsAt && now < room.startsAt) ||
        (room.endsAt && now > room.endsAt)
      )
    ) {
      return res
        .status(403)
        .json({ message: "Quiz not available at this time" });
    }

    let currentAttempts = 0;

    if (req.user!.role.includes(Role.STUDENT)) {
      currentAttempts = await Attempt.countDocuments({
        quizRoom: room._id,
        student: req.user!.sub,
      });
    }

    return res.json({
      data: {
        ...room.toObject(),
        currentAttempts, // ✅ FRONTEND USES THIS
      },
    });
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

  const now = new Date();

  if (room.startsAt && now < room.startsAt) {
    return res.status(403).json({ message: "Quiz has not started yet" });
  }

  if (room.endsAt && now > room.endsAt) {
    return res.status(403).json({ message: "Quiz has ended" });
  }

  return res.json({
    data: { roomId: room._id },
  });
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

// GET /api/v1/rooms/available
export const getAvailableRooms = async (req: AuthRequest, res: Response) => {
  const now = new Date();

  const rooms = await QuizRoom.find({
    active: true,
    visibility: "PUBLIC",
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .populate("quiz", "title description difficulty questions")
    .sort({ createdAt: -1 });

  res.json({ data: rooms });
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ message: "Invalid room id" });
  }

  const room = await QuizRoom.findById(roomId);

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  // ownership check
  if (
    room.lecturer.toString() !== req.user!.sub &&
    !req.user!.role.includes(Role.ADMIN)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // OPTIONAL but smart: prevent deletion if attempts exist
  const attemptsCount = await Attempt.countDocuments({
    quizRoom: room._id,
  });

  if (attemptsCount > 0) {
    return res.status(400).json({
      message: "Cannot delete room with student attempts",
    });
  }

  await room.deleteOne();

  res.json({ message: "Room deleted successfully" });
};