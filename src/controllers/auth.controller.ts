import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { Role } from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { signAccessToken, signRefreshToken } from "../utils/tokens";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// /api/v1/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;

    const roles = Array.isArray(role) ? role : [role];

    if (roles.includes(Role.ADMIN)) {
      throw new AppError("Admin registration forbidden", 403);
    }

    if (!name || !email || !password || !role) {
      throw new AppError("All fields are required", 400);
    }

    const exists = await User.findOne({ email });
    if (exists) {
      throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: roles,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError("Invalid email or password", 401);
    }

    // Invalidate old refresh tokens
    await RefreshToken.deleteMany({ user: user._id });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/auth/refresh-token
export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token required", 400);
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      throw new AppError("Invalid refresh token", 403);
    }

    const payload = jwt.verify(
      refreshToken,
      JWT_REFRESH_SECRET
    ) as jwt.JwtPayload;

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError("User not found", 401);
    }

    // Rotate refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    await RefreshToken.create({
      user: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
};

// /api/v1/auth/me
export const getMe = async (
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

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
