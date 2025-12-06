import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";

import {
  generateNotes,
  generateFlashcards,
  generateQuiz,
} from "../controllers/ai.controller";

const router = Router();

// Students & Lecturers can use AI
router.post(
  "/generate-notes",
  authenticate,
  requireRole([Role.STUDENT, Role.LECTURER, Role.ADMIN]),
  generateNotes
);

router.post(
  "/generate-flashcards",
  authenticate,
  requireRole([Role.STUDENT, Role.LECTURER, Role.ADMIN]),
  generateFlashcards
);

router.post(
  "/generate-quiz",
  authenticate,
  requireRole([Role.STUDENT, Role.LECTURER, Role.ADMIN]),
  generateQuiz
);

export default router;
