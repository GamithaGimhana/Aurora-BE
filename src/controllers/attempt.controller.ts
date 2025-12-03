import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Attempt from "../models/Attempt";
import QuizRoom from "../models/QuizRoom";
import Quiz from "../models/Quiz";
import Question from "../models/Question";

// /api/v1/attempts/create
export const createAttempt = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { quizRoomId, responses } = req.body;

    if (!quizRoomId || !responses || !Array.isArray(responses)) {
      return res.status(400).json({
        message: "quizRoomId and responses are required",
      });
    }

    // Validate room
    const room = await QuizRoom.findById(quizRoomId).populate("quiz");
    if (!room) return res.status(404).json({ message: "Quiz room not found" });
    if (!room.active) return res.status(400).json({ message: "Room is closed" });

    // Get quiz to validate questions
    const quiz = await Quiz.findById(room.quiz).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Map of correct answers
    const questionMap = new Map();
    quiz.questions.forEach((q: any) => {
      questionMap.set(q._id.toString(), q.correctAnswer);
    });

    // Validate & compute score
    let score = 0;

    const processedResponses = await Promise.all(
      responses.map(async (resp: any) => {
        const questionId = resp.question;
        const selected = resp.selected;

        const correctAnswer = questionMap.get(questionId);
        const isCorrect = selected === correctAnswer;

        if (isCorrect) score++;

        return {
          question: questionId,
          selected,
          correct: isCorrect,
        };
      })
    );

    const attempt = new Attempt({
      student: req.user.sub,
      quizRoom: quizRoomId,
      responses: processedResponses,
      score,
    });

    await attempt.save();

    res.status(201).json({
      message: "Attempt submitted",
      data: {
        attemptId: attempt._id,
        score,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};

// /api/v1/attempts/room/:roomId
export const getAttemptsByRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;

    const attempts = await Attempt.find({ quizRoom: roomId })
      .populate("student", "name email")
      .sort({ score: -1 });

    res.status(200).json({
      message: "Attempts fetched",
      data: attempts,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attempts" });
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
    const attempt = await Attempt.findById(req.params.id)
      .populate("student", "name email")
      .populate({
        path: "quizRoom",
        populate: { path: "quiz" },
      })
      .populate("responses.question");

    if (!attempt)
      return res.status(404).json({ message: "Attempt not found" });

    res.status(200).json({
      message: "Attempt fetched",
      data: attempt,
    });

  } catch (err) {
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
