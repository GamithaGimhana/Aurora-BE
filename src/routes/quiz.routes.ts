import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createQuiz,
  getMyQuizzes,
  getSingleQuiz,
  updateQuiz,
  deleteQuiz
} from "../controllers/quiz.controller";

const router = Router();

router.post("/", authenticate, createQuiz);
router.get("/", authenticate, getMyQuizzes);
router.get("/:id", authenticate, getSingleQuiz);
router.put("/:id", authenticate, updateQuiz);
router.delete("/:id", authenticate, deleteQuiz);

export default router;
