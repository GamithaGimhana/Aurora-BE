import { Request, Response, NextFunction } from "express";
import Question from "../models/Question";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";

// /api/v1/questions
export const createQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, options, answer, topic } = req.body;

    if (!question || !options || options.length < 2 || !answer) {
      throw new AppError("All fields are required", 400);
    }

    const q = await Question.create({
      question,
      options,
      answer,
      topic,
      createdBy: req.user!.sub,
    });

    res.status(201).json({ data: q });
  } catch (err) {
    next(err);
  }
};

// /api/v1/questions/me
export const getMyQuestions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const questions = await Question.find({
      createdBy: req.user!.sub,
    }).sort({ createdAt: -1 });

    res.status(200).json({ data: questions });
  } catch (err) {
    next(err);
  }
};

// /api/v1/questions/:id
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = await Question.findById(req.params.id);

    if (!q) {
      throw new AppError("Question not found", 404);
    }

    res.status(200).json({ data: q });
  } catch (err) {
    next(err);
  }
};

// /api/v1/questions/delete/:id
export const deleteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = await Question.findById(req.params.id);

    if (!q) {
      throw new AppError("Question not found", 404);
    }

    if (q.createdBy.toString() !== req.user!.sub) {
      throw new AppError("Forbidden", 403);
    }

    await q.deleteOne();

    res.status(200).json({ data: true });
  } catch (err) {
    next(err);
  }
};

// /api/v1/questions
export const getAllQuestions = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json({ data: questions });
  } catch (err) {
    next(err);
  }
};
