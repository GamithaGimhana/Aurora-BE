import { Request, Response } from "express";
import Question from "../models/Question";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * POST /api/v1/questions/create
 */
export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { question, options, answer, topic } = req.body;

    if (!question || !options || options.length < 2 || !answer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const q = await Question.create({
      question,
      options,
      answer,
      topic,
      createdBy: req.user!.sub,
    });

    return res.status(201).json({ data: q });
  } catch (err) {
    console.error("createQuestion", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/v1/questions/me
 */
export const getMyQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const questions = await Question.find({ createdBy: req.user!.sub }).sort({
      createdAt: -1,
    });

    return res.json({ data: questions });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/v1/questions/:id
 */
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: "Question not found" });

    return res.json({ data: q });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/v1/questions/:id
 */
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: "Question not found" });

    if (q.createdBy.toString() !== req.user!.sub) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await q.deleteOne();
    return res.json({ data: true });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/v1/questions
 * Student / Lecturer / Admin
 */
export const getAllQuestions = async (_req: Request, res: Response) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    return res.json({ data: questions });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
