import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Question from "../models/Question";

// /api/v1/questions/create
export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { question, options, answer, explanation, topic } = req.body;

    if (!question || !options || !answer || !topic) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Options must be an array of at least 2 items" });
    }

    const newQuestion = new Question({
      question,
      options,
      answer,
      explanation,
      topic,
      user: req.user.sub,
    });

    await newQuestion.save();

    res.status(201).json({
      message: "Question created successfully",
      data: newQuestion,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create question" });
  }
};

// /api/v1/questions?page=1&limit=10
export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments();

    res.status(200).json({
      message: "Questions fetched successfully",
      data: questions,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

// /api/v1/questions/me
export const getMyQuestions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ user: req.user.sub })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ user: req.user.sub });

    res.status(200).json({
      message: "Your questions fetched successfully",
      data: questions,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your questions" });
  }
};

// /api/v1/questions/:id
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question fetched successfully",
      data: question,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch question" });
  }
};

// /api/v1/questions/update/:id
export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const updated = await Question.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Question not found or access denied",
      });
    }

    res.status(200).json({
      message: "Question updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update question" });
  }
};

// /api/v1/questions/delete/:id
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Question.findOneAndDelete({
      _id: req.params.id,
      user: req.user.sub,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Question not found or access denied",
      });
    }

    res.status(200).json({
      message: "Question deleted successfully",
      data: deleted,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete question" });
  }
};
