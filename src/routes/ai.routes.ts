import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
// import { upload } from "../middlewares/upload.middleware";
import { Role } from "../models/User";

import {
  generateNotes,
  generateFlashcards,
  generateQuiz,
} from "../controllers/ai.controller";

const router = Router();

// Students & Lecturers can use AI
router.post(
  "/generate/notes",
  authenticate,
  requireRole("STUDENT", "LECTURER", "ADMIN"),
  // upload.single("file"),
  generateNotes
);

router.post(
  "/generate/flashcards",
  authenticate,
  requireRole("STUDENT", "LECTURER", "ADMIN"),
  generateFlashcards
);

router.post(
  "/generate/quiz",
  authenticate,
  requireRole("STUDENT", "LECTURER", "ADMIN"),
  generateQuiz
);

export default router;
