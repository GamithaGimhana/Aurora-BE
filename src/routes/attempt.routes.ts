import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";

import {
  createAttempt,
  getAttemptsByRoom,
  getMyAttempts,
  getAttemptById,
  deleteAttempt,
  submitAttempt,
} from "../controllers/attempt.controller";

const router = Router();

router.post(
  "/create",
  authenticate,
  requireRole([Role.STUDENT]),
  createAttempt
);

// Leaderboard for a room
router.get(
  "/room/:roomId",
  authenticate,
  getAttemptsByRoom
);

// Student's own attempts
router.get("/me", authenticate, requireRole([Role.STUDENT]), getMyAttempts);

// Get single attempt
router.get("/:id", authenticate, getAttemptById);

// Delete attempt (LECTURER + ADMIN)
router.delete(
  "/delete/:id",
  authenticate,
  requireRole([Role.LECTURER, Role.ADMIN]),
  deleteAttempt
);

router.post("/:id/submit", authenticate, submitAttempt);

export default router;
