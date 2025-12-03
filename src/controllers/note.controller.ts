import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Note from "../models/Note";

// /api/v1/notes/create
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
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
    console.error(err);
    res.status(500).json({ message: "Failed to create note" });
  }
};

// /api/v1/notes?page=1&limit=10
export const getAllNotes = async (req: Request, res: Response) => {
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
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

// /api/v1/notes/me
export const getMyNotes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

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
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your notes" });
  }
};

// /api/v1/notes/:id
export const getNoteById = async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.status(200).json({
      message: "Note fetched successfully",
      data: note,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get note" });
  }
};

// /api/v1/notes/update/:id
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Note not found or access denied" });

    res.status(200).json({
      message: "Note updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update note" });
  }
};

// /api/v1/notes/delete/:id
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.sub,
    });

    if (!deleted)
      return res.status(404).json({ message: "Note not found or access denied" });

    res.status(200).json({
      message: "Note deleted successfully",
      data: deleted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete note" });
  }
};
