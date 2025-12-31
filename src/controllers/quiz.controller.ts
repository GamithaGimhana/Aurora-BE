import { Request, Response } from "express";
import { Types } from "mongoose";
import Quiz from "../models/Quiz";
import Question from "../models/Question";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, difficulty, questions, selectedQuestions } = req.body;

    if (!title || (!questions?.length && !selectedQuestions?.length)) {
      return res.status(400).json({ message: "Invalid quiz data" });
    }

    let questionIds: Types.ObjectId[] = [];

    // Create inline questions
    if (questions?.length) {
      const created = await Question.insertMany(
        questions.map((q: any) => ({
          ...q,
          createdBy: new Types.ObjectId(req.user!.sub),
        }))
      );

      questionIds.push(...created.map((q) => q._id));
    }

    // Attach existing question bank questions
    if (selectedQuestions?.length) {
      questionIds.push(
        ...selectedQuestions.map((id: string) => new Types.ObjectId(id))
      );
    }

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      difficulty,
      questions: questionIds,
      createdBy: new Types.ObjectId(req.user!.sub),
    });

    return res.status(201).json({ data: quiz });
  } catch (err) {
    console.error("createQuiz", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/v1/quizzes/me
 */
export const getMyQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user!.sub }).populate("questions");

    return res.json({ data: quizzes });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/v1/quizzes/:id
 */
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    return res.json({ data: quiz });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/v1/quizzes/:id
 */
export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.createdBy.toString() !== req.user!.sub) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await quiz.deleteOne();
    return res.json({ data: true });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
