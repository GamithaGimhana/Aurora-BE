import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Question, { QuestionType } from "../models/Question";
import Quiz from "../models/Quiz";
import { Types } from "mongoose";

// POST /api/questions
export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { quizId, text, choices, correctIndex, type } = req.body;

    if (!quizId || !text || !type)
      return res.status(400).json({ message: "Missing fields" });

    // Check if quiz belongs to the user
    const quiz = await Quiz.findOne({
      _id: quizId,
      ownerId: req.user.sub
    });

    if (!quiz)
      return res.status(403).json({ message: "You do not own this quiz" });

    // MCQ must have choices & correctIndex
    if (type === QuestionType.MCQ) {
      if (!choices || !Array.isArray(choices) || choices.length < 2)
        return res.status(400).json({ message: "MCQ requires at least 2 choices" });

      if (correctIndex === undefined || correctIndex < 0 || correctIndex >= choices.length)
        return res.status(400).json({ message: "Invalid correctIndex" });
    }

    const question = new Question({
      quizId,
      text,
      choices,
      correctIndex,
      type
    });

    await question.save();

    // Add question to quiz
    quiz.questionIds.push(new Types.ObjectId(question._id));
    await quiz.save();

    return res.status(201).json({
      message: "Question created successfully",
      data: question
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create question" });
  }
};

// GET /api/questions?quizId=xxxx&page=1&limit=10
export const getQuestions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const quizId = req.query.quizId as string;
    if (!quizId)
      return res.status(400).json({ message: "quizId required" });

    // Validate ownership
    const quiz = await Quiz.findOne({
      _id: quizId,
      ownerId: req.user.sub
    });

    if (!quiz)
      return res.status(403).json({ message: "You do not own this quiz" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ quizId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ quizId });

    return res.status(200).json({
      message: "Questions fetched successfully",
      data: questions,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

// GET /api/questions/:id
export const getSingleQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    // Check quiz ownership
    const quiz = await Quiz.findOne({
      _id: question.quizId,
      ownerId: req.user.sub
    });

    if (!quiz)
      return res.status(403).json({ message: "You do not own this quiz" });

    return res.status(200).json({ data: question });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get question" });
  }
};

// PUT /api/questions/:id
export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    const quiz = await Quiz.findOne({
      _id: question.quizId,
      ownerId: req.user.sub
    });

    if (!quiz)
      return res.status(403).json({ message: "Not your quiz" });

    const updated = await Question.findByIdAndUpdate(id, req.body, {
      new: true
    });

    return res.status(200).json({
      message: "Question updated successfully",
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update question" });
  }
};

// DELETE /api/questions/:id
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    const quiz = await Quiz.findOne({
      _id: question.quizId,
      ownerId: req.user.sub
    });

    if (!quiz)
      return res.status(403).json({ message: "Not your quiz" });

    // Remove question from quiz list
    quiz.questionIds = quiz.questionIds.filter(
      (qId) => qId.toString() !== id
    );
    await quiz.save();

    await question.deleteOne();

    return res.status(200).json({ message: "Question deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete question" });
  }
};
