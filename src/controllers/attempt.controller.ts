import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Attempt from "../models/Attempt";
import QuizRoom from "../models/QuizRoom";
import mongoose from "mongoose";
import Question from "../models/Question";

export const createAttempt = async (req: any, res: Response) => {
  try {
    const { quizRoomId, answers } = req.body;
    const studentId = req.user.sub;

    // Validate quiz room
    // const room = await QuizRoom.findById(quizRoomId).populate("quiz");
    const room = await QuizRoom.findById(quizRoomId).populate({
      path: "quiz",
      populate: {
        path: "questions",
      },
    });

    if (!room || !room.active) {
      return res.status(404).json({ message: "Quiz room not active" });
    }

    // Time window validation
    if (room.endsAt && new Date() > room.endsAt) {
      return res.status(403).json({ message: "Quiz time expired" });
    }

    // Attempt count validation
    const attemptCount = await Attempt.countDocuments({
      quizRoom: quizRoomId,
      student: studentId,
    });

    if (attemptCount >= room.maxAttempts) {
      return res.status(403).json({ message: "Attempt limit reached" });
    }

    // Score calculation (SERVER-SIDE)
    const quiz: any = room.quiz;

    let score = 0;

    const responses = quiz.questions.map((q: any) => {
      const userAnswer = answers.find(
        (a: any) => a.questionId === q._id.toString()
      );

      const selected = userAnswer?.selected || "";
      const correct = selected === q.answer;

      if (correct) score++;

      return {
        question: q._id,
        selected,
        correct,
      };
    });

    // Save attempt
    const attempt = await Attempt.create({
      quizRoom: quizRoomId,
      student: studentId,
      attemptNumber: attemptCount + 1,
      responses,
      score,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      message: "Quiz submitted successfully",
      attemptId: attempt._id,
      score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};

// /api/v1/attempts/room/:roomId
export const getAttemptsByRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    // const attempts = await Attempt.find({ quizRoom: roomId })
    const attempts = await Attempt.find({
      quizRoom: roomId,
      submittedAt: { $ne: null },
    })
      .populate("student", "name")
      .sort({ score: -1, submittedAt: 1 });

    return res.status(200).json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

// /api/v1/attempts/me
export const getMyAttempts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const attempts = await Attempt.find({ student: req.user.sub })
      .populate({
        path: "quizRoom",
        populate: { path: "quiz" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your attempts fetched",
      data: attempts,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your attempts" });
  }
};

// /api/v1/attempts/:id
export const getAttemptById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attempt = await Attempt.findById(id)
      .populate("student", "name")
      .populate({
        path: "quizRoom",
        populate: {
          path: "quiz",
        },
      });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const quiz: any = (attempt.quizRoom as any).quiz;

    const detailedResponses = attempt.responses.map((r: any) => {
      const question = quiz.questions.find(
        (q: any) => q._id.toString() === r.question.toString()
      );

      return {
        question: question.question,
        options: question.options,
        correctAnswer: question.answer,
        selectedAnswer: r.selected,
        correct: r.correct,
      };
    });

    return res.status(200).json({
      student: (attempt.student as any).name,
      score: attempt.score,
      submittedAt: attempt.submittedAt,
      responses: detailedResponses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch attempt" });
  }
};

// /api/v1/attempts/delete/:id (admin/lecturer only)
export const deleteAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Attempt.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Attempt not found" });

    res.status(200).json({
      message: "Attempt deleted",
      data: deleted,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete attempt" });
  }
};

export const submitAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { id: attemptId } = req.params;
    const userId = req.user!.sub;
    const answers: { questionId: string; selected: string }[] = req.body.answers;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    // Ensure same student
    if (attempt.student.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to submit this attempt" });
    }

    // Load the related questions
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    const responses = answers.map((a) => {
      const q = questions.find((qq) => qq._id.toString() === a.questionId);
      const correct = !!q && q.answer === a.selected;

      if (correct) score += 1;

      return {
        question: new mongoose.Types.ObjectId(a.questionId), // ✅ FIX
        selected: a.selected,
        correct,
      };
    });

    attempt.responses = responses;
    attempt.score = score;
    attempt.submittedAt = new Date();
    await attempt.save();

    return res.json({ attempt });
  } catch (err) {
    console.error("submitAttempt error", err);
    return res.status(500).json({ message: "Server error" });
  }
};