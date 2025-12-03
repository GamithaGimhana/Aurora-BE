import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import {
  createNote,
  getAllNotes,
  getMyNotes,
  getNoteById,
  updateNote,
  deleteNote
} from "../controllers/note.controller";

const router = Router();

// /api/v1/notes/create
router.post("/create", authenticate, createNote);

// /api/v1/notes?page=1&limit=10
router.get("/", getAllNotes);

// /api/v1/notes/me
router.get("/me", authenticate, getMyNotes);

// /api/v1/notes/:id
router.get("/:id", authenticate, getNoteById);

// /api/v1/notes/update/:id
router.put("/update/:id", authenticate, updateNote);

// /api/v1/notes/delete/:id
router.delete("/delete/:id", authenticate, deleteNote);

export default router;
