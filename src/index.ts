import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import noteRoutes from "./routes/note.routes";
import flashcardRoutes from "./routes/flashcard.routes";
import questionRoutes from "./routes/question.routes";
import quizRoutes from "./routes/quiz.routes";
import quizRoomRoutes from "./routes/quizRoom.routes";
import attemptRoutes from "./routes/attempt.routes";
import { createDefaultAdmin } from "./config/createAdmin";
import adminRoutes from "./routes/admin.routes";
import { authenticate } from "./middlewares/auth.middleware";

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT || 5000;

const app = express();

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://aurora-be.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes)

app.use(authenticate);

app.use("/api/v1/admin", adminRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/rooms', quizRoomRoutes);
app.use('/api/v1/attempts', attemptRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

// Start server
const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();
  app.listen(SERVER_PORT, () =>
    console.log(`Server running on port ${SERVER_PORT}`)
  );
};

startServer();
