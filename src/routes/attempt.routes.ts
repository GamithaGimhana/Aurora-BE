import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  submitAttempt,
  getLeaderboard
} from "../controllers/attempt.controller";

const router = Router();

router.post("/submit/:roomCode", authenticate, submitAttempt);
router.get("/leaderboard/:roomCode", authenticate, getLeaderboard);

export default router;
