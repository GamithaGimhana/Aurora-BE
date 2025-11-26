import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Quiz from "../models/Quiz";
import Question from "../models/Question";
import { Types } from "mongoose";

// POST /api/quizzes
export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { title, visibility } = req.body;

    if (!title)
      return res.status(400).json({ message: "Title is required" });

    const quiz = new Quiz({
      ownerId: new Types.ObjectId(req.user.sub),
      title,
      questionIds: [],
      visibility: visibility || "PRIVATE"
    });

    await quiz.save();

    return res.status(201).json({
      message: "Quiz created successfully",
      data: quiz
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create quiz" });
  }
};

// GET /api/quizzes?page=1&limit=10
export const getMyQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find({ ownerId: req.user.sub })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments({ ownerId: req.user.sub });

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      data: quizzes,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get quizzes" });
  }
};

// GET /api/quizzes/:id
export const getSingleQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      ownerId: req.user.sub
    }).populate("questionIds");

    if (!quiz)
      return res.status(404).json({ message: "Quiz not found" });

    return res.status(200).json({ data: quiz });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get quiz" });
  }
};

// PUT /api/quizzes/:id
export const updateQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const updated = await Quiz.findOneAndUpdate(
      { _id: id, ownerId: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Quiz not found or not yours" });

    return res.status(200).json({
      message: "Quiz updated successfully",
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update quiz" });
  }
};

// DELETE /api/quizzes/:id
export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      ownerId: req.user.sub
    });

    if (!quiz)
      return res.status(404).json({ message: "Quiz not found" });

    // Remove all associated questions
    await Question.deleteMany({ quizId: quiz._id });

    await quiz.deleteOne();

    return res.status(200).json({
      message: "Quiz and all associated questions deleted"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};
