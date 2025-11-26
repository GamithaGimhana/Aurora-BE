import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Flashcard, { Difficulty } from "../models/Flashcard";
import Note from "../models/Note";
import { Types } from "mongoose";

// POST /api/flashcards
export const createFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) 
      return res.status(401).json({ message: "Unauthorized" });

    const { noteId, question, answer, difficulty } = req.body;

    if (!noteId || !question || !answer)
      return res.status(400).json({ message: "Missing fields" });

    const noteExists = await Note.findOne({
      _id: noteId,
      ownerId: req.user.sub
    });

    if (!noteExists)
      return res.status(404).json({ message: "Note not found or not yours" });

    const newFlashcard = new Flashcard({
      ownerId: new Types.ObjectId(req.user.sub),
      noteId,
      question,
      answer,
      difficulty: difficulty || Difficulty.MEDIUM
    });

    await newFlashcard.save();

    return res.status(201).json({
      message: "Flashcard created successfully",
      data: newFlashcard
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create flashcard" });
  }
};

// GET /api/flashcards?noteId=xxxx&page=1&limit=10
export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const noteId = req.query.noteId as string;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { ownerId: req.user.sub };
    if (noteId) query.noteId = noteId;

    const flashcards = await Flashcard.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Flashcard.countDocuments(query);

    return res.status(200).json({
      message: "Flashcards fetched successfully",
      data: flashcards,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get flashcards" });
  }
};

// GET /api/flashcards/:id
export const getSingleFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const card = await Flashcard.findOne({
      _id: id,
      ownerId: req.user.sub
    });

    if (!card)
      return res.status(404).json({ message: "Flashcard not found" });

    return res.status(200).json({ data: card });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get flashcard" });
  }
};

// PUT /api/flashcards/:id
export const updateFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const updated = await Flashcard.findOneAndUpdate(
      { _id: id, ownerId: req.user.sub },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Flashcard not found or not yours" });

    return res.status(200).json({
      message: "Flashcard updated successfully",
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update flashcard" });
  }
};

// DELETE /api/flashcards/:id
export const deleteFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    const deleted = await Flashcard.findOneAndDelete({
      _id: id,
      ownerId: req.user.sub
    });

    if (!deleted)
      return res.status(404).json({ message: "Flashcard not found" });

    return res.status(200).json({ message: "Flashcard deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete flashcard" });
  }
};
