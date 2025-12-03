import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import {
  createFlashcard,
  getAllFlashcards,
  getMyFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
} from "../controllers/flashcard.controller";

const router = Router();

// /api/v1/flashcards/create
router.post("/create", authenticate, createFlashcard);

// /api/v1/flashcards
router.get("/", getAllFlashcards);

// /api/v1/flashcards/me
router.get("/me", authenticate, getMyFlashcards);

// /api/v1/flashcards/:id
router.get("/:id", authenticate, getFlashcardById);

// /api/v1/flashcards/update/:id
router.put("/update/:id", authenticate, updateFlashcard);

// /api/v1/flashcards/delete/:id
router.delete("/delete/:id", authenticate, deleteFlashcard);

export default router;
