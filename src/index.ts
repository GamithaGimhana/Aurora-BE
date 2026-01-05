import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db";
import { createDefaultAdmin } from "./config/createAdmin";

import authRoutes from "./routes/auth.routes";
import noteRoutes from "./routes/note.routes";
import flashcardRoutes from "./routes/flashcard.routes";
import questionRoutes from "./routes/question.routes";
import quizRoutes from "./routes/quiz.routes";
import quizRoomRoutes from "./routes/quizRoom.routes";
import attemptRoutes from "./routes/attempt.routes";
import adminRoutes from "./routes/admin.routes";

import { authenticate } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

// DB CONNECTION 
let isConnected = false;

const connectOnce = async () => {
  if (isConnected) return;
  await connectDB();
  await createDefaultAdmin();
  isConnected = true;
};

connectOnce().catch(console.error);

// MIDDLEWARES 
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://aurora-fe-eight.vercel.app",
//     ],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://aurora-fe-eight.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// ROUTES 
app.get("/", (_req, res) => {
  res.json({ message: "Backend running on Vercel !!!" });
});

app.use("/api/v1/auth", authRoutes);

app.use(authenticate);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/flashcards", flashcardRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/rooms", quizRoomRoutes);
app.use("/api/v1/attempts", attemptRoutes);

app.use(errorHandler);

export default app;
