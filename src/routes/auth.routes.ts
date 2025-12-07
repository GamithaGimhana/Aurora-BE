import { Router } from "express";
import { register, login, handleRefreshToken, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", handleRefreshToken);
router.get("/me", authenticate, getMe);

export default router;
