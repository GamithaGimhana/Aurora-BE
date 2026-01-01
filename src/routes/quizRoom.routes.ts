import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";
import {
  createQuizRoom,
  startQuiz,
  getMyRooms,
  getRoomById,
} from "../controllers/quizRoom.controller";

const router = Router();

router.post(
  "/create",
  authenticate,
  requireRole([Role.LECTURER, Role.ADMIN]),
  createQuizRoom
);

router.post(
  "/:roomId/start",
  authenticate,
  requireRole([Role.STUDENT]),
  startQuiz
);

router.get(
  "/me",
  authenticate,
  requireRole([Role.LECTURER]),
  getMyRooms
);

router.get(
  "/:roomId", 
  authenticate, 
  getRoomById
);

export default router;
