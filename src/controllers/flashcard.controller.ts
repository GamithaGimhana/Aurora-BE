import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Flashcard from "../models/Flashcard";
import { AppError } from "../utils/AppError";

// /api/v1/flashcards/create
export const createFlashcard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { question, answer, topic } = req.body;

    if (!question || !answer || !topic) {
      throw new AppError("All fields are required", 400);
    }

    const newFlashcard = new Flashcard({
      question,
      answer,
      topic,
      user: req.user.sub,
    });

    await newFlashcard.save();

    res.status(201).json({
      message: "Flashcard created successfully",
      data: newFlashcard,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/flashcards?page=1&limit=10
export const getAllFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const flashcards = await Flashcard.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Flashcard.countDocuments();

    res.status(200).json({
      message: "Flashcards fetched successfully",
      data: flashcards,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/flashcards/me
export const getMyFlashcards = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { user: req.user.sub };

    if (req.query.topic) {
      filter.topic = req.query.topic;
    }

    const flashcards = await Flashcard.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Flashcard.countDocuments(filter);

    res.status(200).json({
      message: "Your flashcards fetched successfully",
      data: flashcards,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/flashcards/:id
export const getFlashcardById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      throw new AppError("Flashcard not found", 404);
    }

    res.status(200).json({
      message: "Flashcard fetched successfully",
      data: flashcard,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/flashcards/update/:id
export const updateFlashcard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const updated = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated) {
      throw new AppError("Flashcard not found or access denied", 404);
    }

    res.status(200).json({
      message: "Flashcard updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/flashcards/delete/:id
export const deleteFlashcard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const deleted = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      user: req.user.sub,
    });

    if (!deleted) {
      throw new AppError("Flashcard not found or access denied", 404);
    }

    res.status(200).json({
      message: "Flashcard deleted successfully",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};
