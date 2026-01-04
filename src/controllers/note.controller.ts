import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Note from "../models/Note";
import { AppError } from "../utils/AppError";

// /api/v1/notes/create
export const createNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { title, content } = req.body;

    if (!title || !content) {
      throw new AppError("Title and content are required", 400);
    }

    const newNote = new Note({
      title,
      content,
      user: req.user.sub,
    });

    await newNote.save();

    res.status(201).json({
      message: "Note created successfully",
      data: newNote,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/notes?page=1&limit=10
export const getAllNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments();

    res.status(200).json({
      message: "Notes fetched successfully",
      data: notes,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/notes/me
export const getMyNotes = async (
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

    const notes = await Note.find({ user: req.user.sub })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({ user: req.user.sub });

    res.status(200).json({
      message: "Notes fetched successfully",
      data: notes,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/notes/:id
export const getNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      throw new AppError("Note not found", 404);
    }

    res.status(200).json({
      message: "Note fetched successfully",
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/notes/update/:id
export const updateNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated) {
      throw new AppError("Note not found or access denied", 404);
    }

    res.status(200).json({
      message: "Note updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/notes/delete/:id
export const deleteNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.sub,
    });

    if (!deleted) {
      throw new AppError("Note not found or access denied", 404);
    }

    res.status(200).json({
      message: "Note deleted successfully",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};
