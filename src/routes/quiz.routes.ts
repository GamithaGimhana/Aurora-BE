import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import {
  createQuiz,
  getAllQuizzes,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
} from "../controllers/quiz.controller";

const router = Router();

// /api/v1/quizzes/create
router.post("/create", authenticate, createQuiz);

// /api/v1/quizzes
router.get("/", getAllQuizzes);

// /api/v1/quizzes/me
router.get("/me", authenticate, getMyQuizzes);

// /api/v1/quizzes/:id
router.get("/:id", authenticate, getQuizById);

// /api/v1/quizzes/update/:id
router.put("/update/:id", authenticate, updateQuiz);

// /api/v1/quizzes/delete/:id
router.delete("/delete/:id", authenticate, deleteQuiz);

export default router;
