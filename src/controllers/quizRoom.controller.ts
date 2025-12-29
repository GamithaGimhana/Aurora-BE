import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import QuizRoom from "../models/QuizRoom";
import Attempt from "../models/Attempt";
import Quiz from "../models/Quiz";

// Helper to generate random 6-digit room code
const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// /api/v1/rooms/create
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { quizId, timeLimit } = req.body;

    if (!quizId || !timeLimit)
      return res.status(400).json({ message: "quizId and timeLimit are required" });

    // Validate quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res.status(404).json({ message: "Quiz not found" });

    const roomCode = generateRoomCode();

    const newRoom = new QuizRoom({
      roomCode,
      quiz: quizId,
      lecturer: req.user.sub,
      timeLimit,
      active: true,
    });

    await newRoom.save();

    res.status(201).json({
      message: "Quiz room created successfully",
      data: newRoom,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create quiz room" });
  }
};

// /api/v1/rooms?page=1&limit=10
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const rooms = await QuizRoom.find()
      .populate("quiz")
      .populate("lecturer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuizRoom.countDocuments();

    res.status(200).json({
      message: "Quiz rooms fetched successfully",
      data: rooms,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

// /api/v1/rooms/me
export const getMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const rooms = await QuizRoom.find({ lecturer: req.user.sub })
      .populate("quiz")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your quiz rooms fetched",
      data: rooms,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your rooms" });
  }
};

// /api/v1/rooms/code/:roomCode
export const getRoomByCode = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;

    const room = await QuizRoom.findOne({ roomCode })
      .populate("quiz")
      .populate("lecturer", "name email");

    if (!room)
      return res.status(404).json({ message: "Room not found" });

    if (!room.active) {
      return res.status(403).json({ message: "Quiz room is closed" });
    }

    res.status(200).json({
      message: "Room found",
      data: room,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch room" });
  }
};

// /api/v1/rooms/update/:id
export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const updated = await QuizRoom.findOneAndUpdate(
      { _id: req.params.id, lecturer: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Room not found or access denied" });

    res.status(200).json({
      message: "Room updated successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to update room" });
  }
};

// /api/v1/rooms/delete/:id
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const deleted = await QuizRoom.findOneAndDelete({
      _id: req.params.id,
      lecturer: req.user.sub,
    });

    if (!deleted)
      return res.status(404).json({ message: "Room not found or access denied" });

    res.status(200).json({
      message: "Room deleted successfully",
      data: deleted,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete room" });
  }
};

export const startQuiz = async (req: any, res: any) => {
  try {
    const { roomId } = req.params;
    const studentId = req.user.sub; // from JWT

    // Find room + quiz
    const room = await QuizRoom.findById(roomId).populate("quiz");

    if (!room || !room.active) {
      return res.status(404).json({ message: "Quiz room not available" });
    }

    // Count previous attempts by this student
    const attempts = await Attempt.countDocuments({
      quizRoom: roomId,
      student: studentId,
    });

    if (attempts >= room.maxAttempts) {
      return res.status(403).json({ message: "Attempt limit reached" });
    }

    // Initialize timer (only once)
    if (!room.startsAt) {
      room.startsAt = new Date();
      room.endsAt = new Date(
        Date.now() + room.timeLimit * 60 * 1000
      );
      await room.save();
    }

    // Return quiz WITHOUT answers
    const quiz = room.quiz as any;

    const safeQuestions = quiz.questions.map((q: any) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    return res.json({
      roomId: room._id,
      endsAt: room.endsAt,
      quiz: {
        title: quiz.title,
        questions: safeQuestions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start quiz" });
  }
};

export const closeRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await QuizRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Quiz room not found" });
    }

    room.active = false;
    await room.save();

    return res.status(200).json({
      message: "Quiz room closed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to close quiz room" });
  }
};