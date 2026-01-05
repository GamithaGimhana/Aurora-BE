import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateMyProfile);
router.put("/me/password", authenticate, changeMyPassword);

export default router;
