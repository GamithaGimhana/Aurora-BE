import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";
import User from "../models/User";
import QuizRoom from "../models/QuizRoom";
import Attempt from "../models/Attempt";

const router = Router();

router.get(
  "/users",
  authenticate,
  requireRole([Role.ADMIN]),
  async (_, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
);

router.put(
  "/users/:id/role",
  authenticate,
  requireRole([Role.ADMIN]),
  async (req, res) => {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json(user);
  }
);

router.get(
  "/rooms",
  authenticate,
  requireRole([Role.ADMIN]),
  async (_, res) => {
    const rooms = await QuizRoom.find().populate("quiz lecturer");
    res.json(rooms);
  }
);

router.get(
  "/attempts",
  authenticate,
  requireRole([Role.ADMIN]),
  async (_, res) => {
    const attempts = await Attempt.find().populate("student quizRoom");
    res.json(attempts);
  }
);

export default router;
