import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createNote,
  getMyNotes,
  getSingleNote,
  updateNote,
  deleteNote
} from "../controllers/note.controller";

const router = Router();

router.post("/", authenticate, createNote);
router.get("/", authenticate, getMyNotes);
router.get("/:id", authenticate, getSingleNote);
router.put("/:id", authenticate, updateNote);
router.delete("/:id", authenticate, deleteNote);

export default router;
