import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";
import RefreshToken from "../models/RefreshToken";

// GET /api/v1/users/me
export const getMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await User.findById(req.user.sub).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/users/me
export const updateMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { name, email } = req.body;

    if (!name && !email) {
      throw new AppError("Nothing to update", 400);
    }

    // prevent role updates
    const updatedUser = await User.findByIdAndUpdate(
      req.user.sub,
      { name, email },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/users/me/password
export const changeMyPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw new AppError("Both passwords are required", 400);

    const user = await User.findById(req.user.sub);
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError("Current password is incorrect", 401);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await RefreshToken.deleteMany({ user: user._id });

    res.status(200).json({
      message: "Password updated successfully. Please log in again.",
    });
  } catch (err) {
    next(err);
  }
};
