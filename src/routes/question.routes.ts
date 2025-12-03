import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

import {
  createQuestion,
  getAllQuestions,
  getMyQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller";

const router = Router();

// /api/v1/questions/create
router.post("/create", authenticate, createQuestion);

// /api/v1/questions
router.get("/", getAllQuestions);

// /api/v1/questions/me
router.get("/me", authenticate, getMyQuestions);

// /api/v1/questions/:id
router.get("/:id", authenticate, getQuestionById);

// /api/v1/questions/update/:id
router.put("/update/:id", authenticate, updateQuestion);

// /api/v1/questions/delete/:id
router.delete("/delete/:id", authenticate, deleteQuestion);

export default router;
