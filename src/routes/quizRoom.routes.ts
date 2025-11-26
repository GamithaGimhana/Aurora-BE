import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createRoom,
  startRoom,
  joinRoom,
  getMyRooms,
  deleteRoom
} from "../controllers/quizroom.controller";

const router = Router();

router.post("/", authenticate, createRoom);
router.post("/start/:id", authenticate, startRoom);
router.get("/join/:code", authenticate, joinRoom);
router.get("/my", authenticate, getMyRooms);
router.delete("/:id", authenticate, deleteRoom);

export default router;
