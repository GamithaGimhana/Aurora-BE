import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Attempt from "../models/Attempt";
import QuizRoom from "../models/QuizRoom";
import Quiz from "../models/Quiz";

export const getAttemptsByRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const attempts = await Attempt.find({
      quizRoom: roomId,
      submittedAt: { $ne: null },
    })
      .populate("student", "name email")
      .sort({
        score: -1,
        submittedAt: 1,
      });

    // add rank
    const leaderboard = attempts.map((a, index) => ({
      rank: index + 1,
      student: a.student,
      score: a.score,
      attemptNumber: a.attemptNumber,
      submittedAt: a.submittedAt,
    }));

    return res.json({ data: leaderboard });
  } catch (err) {
    console.error("leaderboard error", err);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
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

/**
 * GET /api/v1/attempts/:id
 * Load attempt + quiz + questions
 */
export const getAttemptById = async (req: AuthRequest, res: Response) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate({
        path: "quizRoom",
        populate: {
          path: "quiz",
          populate: { path: "questions" },
        },
      });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Optional: ensure only owner can access
    if (attempt.student.toString() !== req.user!.sub) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({ data: attempt });
  } catch (err) {
    console.error("getAttemptById error", err);
    return res.status(500).json({ message: "Server error" });
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
  const { answers } = req.body;

  const attempt = await Attempt.findById(req.params.id)
    .populate("quizRoom")
    .populate("responses.question");

  if (!attempt)
    return res.status(404).json({ message: "Attempt not found" });

  if (attempt.submittedAt)
    return res.status(400).json({ message: "Already submitted" });

  const room = attempt.quizRoom as any;
  if (!room.active)
    return res.status(400).json({ message: "Room inactive" });

  const quiz = await Quiz.findById(room.quiz).populate("questions");

  let score = 0;

  attempt.responses = quiz!.questions.map((q: any) => {
    const found = answers.find((a: any) => a.questionId === q._id.toString());
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

  res.json({
    score,
    total: attempt.responses.length,
  });
};
