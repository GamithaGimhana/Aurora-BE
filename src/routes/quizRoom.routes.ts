import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { Role } from "../models/User";

import {
  createRoom,
  getAllRooms,
  getMyRooms,
  getRoomByCode,
  updateRoom,
  deleteRoom,
} from "../controllers/quizRoom.controller";

const router = Router();

// /api/v1/rooms/create (LECTURER, ADMIN)
router.post(
  "/create",
  authenticate,
  requireRole([Role.LECTURER, Role.ADMIN]),
  createRoom
);

// /api/v1/rooms
router.get("/", getAllRooms);

// /api/v1/rooms/me
router.get(
  "/me",
  authenticate,
  requireRole([Role.LECTURER, Role.ADMIN]),
  getMyRooms
);

// /api/v1/rooms/code/:roomCode
router.get("/code/:roomCode", getRoomByCode);

// /api/v1/rooms/update/:id
router.put(
  "/update/:id",
  authenticate,
  requireRole([Role.LECTURER, Role.ADMIN]),
  updateRoom
);

// /api/v1/rooms/delete/:id
router.delete(
  "/delete/:id",
  authenticate,
  requireRole([Role.LECTURER, Role.ADMIN]),
  deleteRoom
);

export default router;
