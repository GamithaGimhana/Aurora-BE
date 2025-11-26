import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const SERVER_PORT = process.env.SERVER_PORT || 5000;

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRoutes)

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend running..." });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(SERVER_PORT, () =>
    console.log(`Server running on port ${SERVER_PORT}`)
  );
};

startServer();
