import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";
import {
  startQuiz,
  getMyRooms,
} from "../controllers/quizRoom.controller";

const router = Router();

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

export default router;
