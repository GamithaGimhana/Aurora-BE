import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { getSystemStats, getAllUsers, updateUserRole, deleteUser } from "../controllers/admin.controller";

const router = Router();

router.use(authenticate);
router.use(requireRole("ADMIN"));

router.get("/stats", getSystemStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

export default router;
