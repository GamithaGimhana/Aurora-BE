import { Router } from "express";
import { register, login, handleRefreshToken } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", handleRefreshToken);

export default router;
