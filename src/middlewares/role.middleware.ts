import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { Role } from "../models/User";

export const requireRole = (role: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role.includes(Role.ADMIN)) {
      return next();
    }

    const hasRole = role.some(role => req.user!.role === role)
    if (!hasRole) {
      return res.status(403).json({
        message: `Require ${role} role`
      })
    }

    next();
  };
};
