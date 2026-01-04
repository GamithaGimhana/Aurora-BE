import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import {
  createQuizRoom,
  startQuiz,
  getMyRooms,
  getRoomById,
  joinRoomByCode,
  toggleRoomActive,
  getAvailableRooms,
  deleteRoom,
} from "../controllers/quizRoom.controller";

const router = Router();

router.get(
  "/available",
  authenticate,
  requireRole("STUDENT", "ADMIN"),
  getAvailableRooms
);

router.post(
  "/create",
  authenticate,
  requireRole("LECTURER", "ADMIN"),
  createQuizRoom
);

router.post(
  "/:roomId/start",
  authenticate,
  requireRole("STUDENT", "LECTURER", "ADMIN"),
  startQuiz
);

router.get(
  "/me",
  authenticate,
  requireRole("LECTURER"),
  getMyRooms
);

router.get(
  "/:roomId", 
  authenticate, 
  getRoomById
);

router.post(
  "/join", 
  authenticate,
  joinRoomByCode
);

router.patch(
  "/:roomId/toggle",
  authenticate,
  requireRole("LECTURER", "ADMIN"),
  toggleRoomActive
);

router.delete(
  "/:roomId",
  authenticate,
  requireRole("LECTURER", "ADMIN"),
  deleteRoom
);

export default router;
