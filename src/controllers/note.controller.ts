import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Note from "../models/Note";
import { Types } from "mongoose";

// POST /api/notes
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { title, topic, content, sourcePdfUrl } = req.body;

    if (!title || !topic || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newNote = new Note({
      ownerId: new Types.ObjectId(req.user.sub),
      title,
      topic,
      content,
      sourcePdfUrl
    });

    await newNote.save();

    return res
      .status(201)
      .json({ message: "Note created successfully", data: newNote });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create note" });
  }
};

// GET /api/notes?page=1&limit=10
export const getMyNotes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ ownerId: req.user.sub })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({ ownerId: req.user.sub });

    return res.status(200).json({
      message: "Notes fetched successfully",
      data: notes,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

// GET /api/notes/:id
export const getSingleNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const note = await Note.findOne({
      _id: id,
      ownerId: req.user.sub
    });

    if (!note)
      return res.status(404).json({ message: "Note not found" });

    return res.status(200).json({ data: note });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch note" });
  }
};

// PUT /api/notes/:id
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const updated = await Note.findOneAndUpdate(
      { _id: id, ownerId: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Note not found or not yours" });

    return res.status(200).json({
      message: "Note updated successfully",
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update note" });
  }
};

// DELETE /api/notes/:id
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const deleted = await Note.findOneAndDelete({
      _id: id,
      ownerId: req.user.sub
    });

    if (!deleted)
      return res.status(404).json({ message: "Note not found" });

    return res.status(200).json({
      message: "Note deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete note" });
  }
};
