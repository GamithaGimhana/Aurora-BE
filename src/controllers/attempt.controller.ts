import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Attempt, { IAttempt } from "../models/Attempt";
import Quiz from "../models/Quiz";
import { AppError } from "../utils/AppError";
import { generateAttemptPDF } from "../services/reports/attemptReport.service";
import { Role } from "../models/User";
import { IQuizRoom } from "../models/QuizRoom";

type AttemptWithPopulatedRoom = Document & IAttempt & {
  quizRoom: IQuizRoom;
};

// /api/v1/attempts/room/:roomId
export const getAttemptsByRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;

    const attempts = await Attempt.find({
      quizRoom: roomId,
      submittedAt: { $ne: null },
    })
      .populate("student", "name email")
      .sort({ score: -1, submittedAt: 1 });

    const leaderboard = attempts.map((a, index) => ({
      rank: index + 1,
      student: a.student,
      score: a.score,
      attemptNumber: a.attemptNumber,
      submittedAt: a.submittedAt,
    }));

    res.status(200).json({ data: leaderboard });
  } catch (err) {
    next(err);
  }
};

// /api/v1/attempts/me
export const getMyAttempts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const attempts = await Attempt.find({ student: req.user.sub })
      .populate({
        path: "quizRoom",
        populate: { path: "quiz" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your attempts fetched",
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/attempts/:id
export const getAttemptById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate({
      path: "quizRoom",
      populate: {
        path: "quiz",
        populate: { path: "questions" },
      },
    });

    if (!attempt) {
      throw new AppError("Attempt not found", 404);
    }

    if (attempt.student.toString() !== req.user!.sub) {
      throw new AppError("Forbidden", 403);
    }

    res.status(200).json({ data: attempt });
  } catch (err) {
    next(err);
  }
};

// /api/v1/attempts/delete/:id
export const deleteAttempt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await Attempt.findByIdAndDelete(req.params.id);

    if (!deleted) {
      throw new AppError("Attempt not found", 404);
    }

    res.status(200).json({
      message: "Attempt deleted",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/attempts/submit/:id
export const submitAttempt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { answers } = req.body;

    const attempt = await Attempt.findById(req.params.id)
      .populate("quizRoom")
      .populate("responses.question");

    if (!attempt) {
      throw new AppError("Attempt not found", 404);
    }

    if (attempt.submittedAt) {
      throw new AppError("Already submitted", 400);
    }

    const room = attempt.quizRoom as any;
    if (!room.active) {
      throw new AppError("Room inactive", 400);
    }

    const quiz = await Quiz.findById(room.quiz).populate("questions");

    let score = 0;

    attempt.responses = quiz!.questions.map((q: any) => {
      const found = answers.find(
        (a: any) => a.questionId === q._id.toString()
      );
      const selected = found?.selected || "";

      const correct = selected === q.answer;
      if (correct) score++;

      return {
        question: q._id,
        selected,
        correct,
      };
    });

    attempt.score = score;
    attempt.submittedAt = new Date();

    await attempt.save();

    res.status(200).json({
      score,
      total: attempt.responses.length,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/attempts/report/:id
export const downloadAttemptReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate("student", "name email")
      .populate({
        path: "quizRoom",
        populate: [
          { path: "quiz", select: "title" },
          { path: "lecturer", select: "_id" },
        ],
      }) as AttemptWithPopulatedRoom | null;

    if (!attempt) {
      throw new AppError("Attempt not found", 404);
    }

    if (!attempt.submittedAt) {
      throw new AppError("Attempt not submitted", 400);
    }

    const userId = req.user!.sub;
    const roles = req.user!.role;

    const isOwner =
      attempt.student._id.toString() === userId;

    const isLecturer = attempt.quizRoom.lecturer.toString() === userId;

    const isAdmin = roles.includes(Role.ADMIN);

    if (!isOwner && !isLecturer && !isAdmin) {
      throw new AppError("Forbidden", 403);
    }

    generateAttemptPDF(attempt, res);
  } catch (err) {
    next(err);
  }
};

