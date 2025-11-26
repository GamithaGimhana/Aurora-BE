import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Quiz from "../models/Quiz";
import QuizRoom from "../models/QuizRoom";
import { Types } from "mongoose";

// Utility to generate a 6-digit code
const generateRoomCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/rooms
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.role?.includes("LECTURER")) {
      return res.status(403).json({ message: "Only lecturers can create rooms" });
    }

    const { quizId, durationMinutes, maxQuestions } = req.body;

    if (!quizId || !durationMinutes || !maxQuestions) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Check lecturer really owns the quiz
    const quiz = await Quiz.findOne({
      _id: quizId,
      ownerId: req.user.sub
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found or not owned by you" });
    }

    const room = new QuizRoom({
      lecturerId: new Types.ObjectId(req.user.sub),
      quizId,
      code: generateRoomCode(),
      durationMinutes,
      maxQuestions,
      isActive: false
    });

    await room.save();

    return res.status(201).json({
      message: "Quiz room created",
      data: room
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create quiz room" });
  }
};

// POST /api/rooms/start/:id
export const startRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.role?.includes("LECTURER")) {
      return res.status(403).json({ message: "Only lecturers can start rooms" });
    }

    const { id } = req.params;

    const room = await QuizRoom.findById(id);
    if (!room)
      return res.status(404).json({ message: "Room not found" });

    if (room.lecturerId.toString() !== req.user.sub)
      return res.status(403).json({ message: "Not your room" });

    room.isActive = true;
    room.startTime = new Date();

    await room.save();

    return res.status(200).json({ message: "Room started", data: room });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to start quiz room" });
  }
};

// GET /api/rooms/join/:code
export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { code } = req.params;

    const room = await QuizRoom.findOne({ code });

    if (!room)
      return res.status(404).json({ message: "Invalid room code" });

    if (!room.isActive)
      return res.status(403).json({ message: "Room is not active yet" });

    // Time validation
    if (room.startTime) {
      const now = Date.now();
      const start = room.startTime.getTime();
      const end = start + room.durationMinutes * 60 * 1000;

      if (now > end) {
        return res.status(403).json({ message: "Room has expired" });
      }
    }

    return res.status(200).json({
      message: "Joined room successfully",
      data: room
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join room" });
  }
};

// GET /api/rooms/my
export const getMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.role?.includes("LECTURER")) {
      return res.status(403).json({ message: "Only lecturers can view rooms" });
    }

    const rooms = await QuizRoom.find({ lecturerId: req.user.sub })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Rooms fetched successfully",
      data: rooms
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

// DELETE /api/rooms/:id
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.role?.includes("LECTURER")) {
      return res.status(403).json({ message: "Only lecturers can delete rooms" });
    }

    const { id } = req.params;

    const room = await QuizRoom.findById(id);
    if (!room)
      return res.status(404).json({ message: "Room not found" });

    if (room.lecturerId.toString() !== req.user.sub)
      return res.status(403).json({ message: "Not your room" });

    await room.deleteOne();

    return res.status(200).json({ message: "Room deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete room" });
  }
};
