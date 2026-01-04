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
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT || 5000;

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://aurora-fe-eight.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow tools like Postman
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"));
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle OPTIONS preflight requests
app.options("*", cors());

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api/v1/auth", authRoutes);

// Protected routes
app.use(authenticate);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/flashcards", flashcardRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/rooms", quizRoomRoutes);
app.use("/api/v1/attempts", attemptRoutes);

// Error handler
app.use(errorHandler);

// -Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

// Start Server
const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();
  app.listen(SERVER_PORT, () =>
    console.log(`Server running on port ${SERVER_PORT}`)
  );
};

startServer();
