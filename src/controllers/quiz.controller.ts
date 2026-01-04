import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Quiz from "../models/Quiz";
import Question from "../models/Question";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";

// /api/v1/quizzes/create
export const createQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, difficulty, questions, selectedQuestions } =
      req.body;

    if (!title || (!questions?.length && !selectedQuestions?.length)) {
      throw new AppError("Invalid quiz data", 400);
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

    res.status(201).json({ data: quiz });
  } catch (err) {
    next(err);
  }
};

// /api/v1/quizzes/me
export const getMyQuizzes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizzes = await Quiz.find({
      createdBy: req.user!.sub,
    }).populate("questions");

    res.status(200).json({ data: quizzes });
  } catch (err) {
    next(err);
  }
};

// /api/v1/quizzes/:id
export const getQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");

    if (!quiz) {
      throw new AppError("Quiz not found", 404);
    }

    res.status(200).json({ data: quiz });
  } catch (err) {
    next(err);
  }
};

// /api/v1/quizzes/delete/:id
export const deleteQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      throw new AppError("Quiz not found", 404);
    }

    if (quiz.createdBy.toString() !== req.user!.sub) {
      throw new AppError("Forbidden", 403);
    }

    await quiz.deleteOne();

    res.status(200).json({ data: true });
  } catch (err) {
    next(err);
  }
};
