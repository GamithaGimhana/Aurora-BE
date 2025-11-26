import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Attempt from "../models/Attempt";
import QuizRoom from "../models/QuizRoom";
import Quiz from "../models/Quiz";
import Question from "../models/Question";
import { Types } from "mongoose";

// POST /api/attempts/submit/:roomCode
export const submitAttempt = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.role?.includes("STUDENT")) {
      return res.status(403).json({ message: "Only students can submit attempts" });
    }

    const { roomCode } = req.params;
    const { answers, timeTakenSeconds } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format" });
    }

    const room = await QuizRoom.findOne({ code: roomCode });
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if room is active
    if (!room.isActive || !room.startTime) {
      return res.status(403).json({ message: "Room is not active" });
    }

    // Time validation
    const now = Date.now();
    const start = room.startTime.getTime();
    const end = start + room.durationMinutes * 60 * 1000;

    if (now > end) {
      return res.status(403).json({ message: "Room time expired" });
    }

    // Prevent duplicate attempts
    const existing = await Attempt.findOne({
      roomId: room._id,
      userId: req.user.sub
    });
    if (existing) {
      return res.status(409).json({ message: "Attempt already submitted" });
    }

    // Fetch quiz + questions
    const quiz = await Quiz.findById(room.quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.find({
      _id: { $in: quiz.questionIds }
    });

    // Score calculation
    const evaluatedAnswers: any[] = [];
    let score = 0;

    for (const ans of answers) {
      const question = questions.find(
        (q) => q._id.toString() === ans.questionId
      );

      if (!question) continue;

      let isCorrect = false;

      switch (question.type) {
        case "MCQ":
          isCorrect = question.correctIndex === ans.answerIndex;
          break;

        case "TRUE_FALSE":
          isCorrect = String(question.correctIndex) === String(ans.answer);
          break;

        case "SHORT":
          isCorrect =
            question.text
              .trim()
              .toLowerCase() ===
            String(ans.answer).trim().toLowerCase();
          break;
      }

      if (isCorrect) score++;

      evaluatedAnswers.push({
        questionId: question._id,
        answer: ans.answer,
        correct: isCorrect
      });
    }

    // Save attempt
    const attempt = new Attempt({
      roomId: room._id,
      userId: new Types.ObjectId(req.user.sub),
      answers: evaluatedAnswers,
      score,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    await attempt.save();

    return res.status(201).json({
      message: "Attempt submitted successfully",
      data: {
        score,
        totalQuestions: questions.length,
        answers: evaluatedAnswers
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit attempt" });
  }
};

// GET /api/attempts/leaderboard/:roomCode
export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.params;

    const room = await QuizRoom.findOne({ code: roomCode });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const attempts = await Attempt.find({ roomId: room._id })
      .populate("userId", "name email")
      .sort({ score: -1, timeTakenSeconds: 1 }); // highest score, shortest time

    return res.status(200).json({
      message: "Leaderboard",
      data: attempts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get leaderboard" });
  }
};
