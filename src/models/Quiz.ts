import mongoose, { Schema, Document, Types } from "mongoose";

export type QuizDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface IQuiz extends Document {
  title: string;
  description?: string;
  difficulty: QuizDifficulty;
  questions: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "EASY",
      required: true,
    },

    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
