import { Response, NextFunction } from "express";
import QuizRoom from "../models/QuizRoom";
import Attempt from "../models/Attempt";
import Quiz from "../models/Quiz";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Role } from "../models/User";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

const generateRoomCode = async (): Promise<string> => {
  let code: string;
  let exists: boolean;

  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = !!(await QuizRoom.exists({ roomCode: code }));
  } while (exists);

  return code;
};

export const createQuizRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
      throw new AppError("Quiz and time limit are required", 400);
    }

    if (!["PUBLIC", "PRIVATE"].includes(visibility)) {
      throw new AppError("Invalid visibility", 400);
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError("Quiz not found", 404);
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

    res.status(201).json({ data: room });
  } catch (err) {
    next(err);
  }
};

export const startQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.sub;

    const room = await QuizRoom.findById(roomId).populate({
      path: "quiz",
      populate: { path: "questions" },
    });

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    if (!room.active) {
      throw new AppError("Room is locked", 403);
    }

    const now = new Date();

    if (room.startsAt && now < room.startsAt) {
      throw new AppError("Quiz has not started yet", 403);
    }

    if (room.endsAt && now > room.endsAt) {
      throw new AppError("Quiz has ended", 403);
    }

    const totalAttempts = await Attempt.countDocuments({
      quizRoom: room._id,
      student: userId,
    });

    if (room.maxAttempts && totalAttempts >= room.maxAttempts) {
      throw new AppError("Attempt limit reached", 403);
    }

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

    res.json({
      attempt,
      quiz: room.quiz,
      endsAt,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyRooms = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const rooms = await QuizRoom.find({ lecturer: req.user!.sub });
    res.json({ data: rooms });
  } catch (err) {
    next(err);
  }
};

export const getRoomById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new AppError("Invalid room id", 400);
    }

    const room = await QuizRoom.findById(roomId).populate({
      path: "quiz",
      populate: { path: "questions" },
    });

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const userId = req.user!.sub;

    const isLecturer = room.lecturer.toString() === userId;
    const isAdmin = req.user!.role.includes(Role.ADMIN);
    const isParticipant = room.participants
      ?.map(id => id.toString())
      .includes(userId);

    if (
      room.visibility === "PRIVATE" &&
      !isLecturer &&
      !isAdmin &&
      !isParticipant
    ) {
      throw new AppError("Private room", 403);
    }

    const now = new Date();

    if (
      req.user!.role.includes(Role.STUDENT) &&
      ((room.startsAt && now < room.startsAt) ||
        (room.endsAt && now > room.endsAt))
    ) {
      throw new AppError("Quiz not available at this time", 403);
    }

    let currentAttempts = 0;

    if (req.user!.role.includes(Role.STUDENT)) {
      currentAttempts = await Attempt.countDocuments({
        quizRoom: room._id,
        student: req.user!.sub,
      });
    }

    res.json({
      data: {
        ...room.toObject(),
        currentAttempts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const joinRoomByCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      throw new AppError("Room code is required", 400);
    }

    const room = await QuizRoom.findOne({
      roomCode: roomCode.toUpperCase(),
      active: true,
    });

    if (!room) {
      throw new AppError("Invalid or inactive room code", 404);
    }

    const now = new Date();

    if (room.startsAt && now < room.startsAt) {
      throw new AppError("Quiz has not started yet", 403);
    }

    if (room.endsAt && now > room.endsAt) {
      throw new AppError("Quiz has ended", 403);
    }

    const userId = new mongoose.Types.ObjectId(req.user!.sub);

    const alreadyJoined = room.participants
      ?.some(id => id.equals(userId));

    if (!alreadyJoined) {
      room.participants.push(userId);
      await room.save();
    }

    res.json({ data: { roomId: room._id } });
  } catch (err) {
    next(err);
  }
};

export const toggleRoomActive = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await QuizRoom.findById(req.params.roomId);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    if (room.lecturer.toString() !== req.user!.sub && !req.user!.role.includes(Role.ADMIN)) {
      throw new AppError("Forbidden", 403);
    }

    room.active = !room.active;
    await room.save();

    res.json({
      message: `Room ${room.active ? "unlocked" : "locked"}`,
      active: room.active,
    });
  } catch (err) {
    next(err);
  }
};

export const getAvailableRooms = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new AppError("Invalid room id", 400);
    }

    const room = await QuizRoom.findById(roomId);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    if (room.lecturer.toString() !== req.user!.sub && !req.user!.role.includes(Role.ADMIN)) {
      throw new AppError("Forbidden", 403);
    }

    const attemptsCount = await Attempt.countDocuments({ quizRoom: room._id });

    if (attemptsCount > 0) {
      throw new AppError("Cannot delete room with student attempts", 400);
    }

    await room.deleteOne();

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    next(err);
  }
};
