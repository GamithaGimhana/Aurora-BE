import { Request, Response, NextFunction } from "express";

export const requireRole = (...allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const userRoles: string[] = req.user?.role || [];

    // Admin override
    if (userRoles.includes("ADMIN")) {
      return next();
    }

    // Lecturer inherits Student
    const expandedRoles = new Set(userRoles);
    if (userRoles.includes("LECTURER")) {
      expandedRoles.add("STUDENT");
    }

    const hasAccess = allowedRoles.some((r) => expandedRoles.has(r));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
