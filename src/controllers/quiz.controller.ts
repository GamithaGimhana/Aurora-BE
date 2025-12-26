import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Quiz from "../models/Quiz";
import Question from "../models/Question";

// /api/v1/quizzes/create
export const createQuiz = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { title, description, questions, topic, difficulty } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "Title and questions are required" });
  }

  const newQuiz = new Quiz({
    title,
    description,
    topic,
    difficulty,
    questions, 
    user: req.user.sub,
  });

  await newQuiz.save();

  res.status(201).json({
    message: "Quiz created successfully",
    data: newQuiz,
  });
};

// /api/v1/quizzes?page=1&limit=10
export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find()
      .populate("user", "name email")
      .populate("questions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments();

    res.status(200).json({
      message: "Quizzes fetched successfully",
      data: quizzes,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

// /api/v1/quizzes/me
export const getMyQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find({ user: req.user.sub })
      .populate("questions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments({ user: req.user.sub });

    res.status(200).json({
      message: "Your quizzes fetched successfully",
      data: quizzes,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your quizzes" });
  }
};

// /api/v1/quizzes/:id
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("questions")
      .populate("user", "name email");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      message: "Quiz fetched successfully",
      data: quiz,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

// /api/v1/quizzes/update/:id
export const updateQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const updated = await Quiz.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Quiz not found or you don't have permission",
      });
    }

    res.status(200).json({
      message: "Quiz updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update quiz" });
  }
};

// /api/v1/quizzes/delete/:id
export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Quiz.findOneAndDelete({
      _id: req.params.id,
      user: req.user.sub,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Quiz not found or access denied",
      });
    }

    res.status(200).json({
      message: "Quiz deleted successfully",
      data: deleted,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};
