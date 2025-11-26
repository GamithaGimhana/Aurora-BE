import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createFlashcard,
  getFlashcards,
  getSingleFlashcard,
  updateFlashcard,
  deleteFlashcard
} from "../controllers/flashcard.controller";

const router = Router();

router.post("/", authenticate, createFlashcard);
router.get("/", authenticate, getFlashcards);
router.get("/:id", authenticate, getSingleFlashcard);
router.put("/:id", authenticate, updateFlashcard);
router.delete("/:id", authenticate, deleteFlashcard);

export default router;
