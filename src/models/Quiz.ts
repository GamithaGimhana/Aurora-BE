import mongoose, { Document, Schema } from "mongoose";

interface IQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  user: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2,
        message: "At least two options are required",
      },
    },
    answer: { type: String, required: true },
  },
  { _id: false } // important: no separate _id per question
);

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    topic: { type: String },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "EASY",
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (v: IQuestion[]) => v.length > 0,
        message: "Quiz must contain at least one question",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>("Quiz", quizSchema);
