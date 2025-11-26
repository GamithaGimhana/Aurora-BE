import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createQuestion,
  getQuestions,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion
} from "../controllers/question.controller";

const router = Router();

router.post("/", authenticate, createQuestion);
router.get("/", authenticate, getQuestions);
router.get("/:id", authenticate, getSingleQuestion);
router.put("/:id", authenticate, updateQuestion);
router.delete("/:id", authenticate, deleteQuestion);

export default router;
