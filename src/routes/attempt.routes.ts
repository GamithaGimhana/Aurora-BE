import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";
import {
  getAttemptsByRoom,
  getMyAttempts,
  getAttemptById,
  deleteAttempt,
  submitAttempt,
  downloadAttemptReport,
} from "../controllers/attempt.controller";

const router = Router();

// Leaderboard for a room
router.get(
  "/room/:roomId",
  authenticate,
  getAttemptsByRoom
);

// Student's own attempts
router.get("/me", authenticate, requireRole("STUDENT"), getMyAttempts);

// Get single attempt
router.get("/:id", authenticate, getAttemptById);

// Delete attempt (LECTURER + ADMIN)
router.delete(
  "/delete/:id",
  authenticate,
  requireRole("LECTURER", "ADMIN"),
  deleteAttempt
);

router.post("/:id/submit", authenticate, submitAttempt);

router.get(
  "/:id/report",
  authenticate,
  downloadAttemptReport
);

export default router;
