import mongoose, { Schema, Document } from "mongoose";

export interface IAttempt extends Document {
  quizRoom: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;

  attemptNumber: number;
  responses: {
    question: mongoose.Types.ObjectId;
    selected: string;
    correct: boolean;
  }[];

  score: number;
  submittedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}


const AttemptSchema = new Schema<IAttempt>(
  {
    quizRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizRoom",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attemptNumber: {
      type: Number,
      required: true,
    },

    responses: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selected: {
          type: String,
          required: true,
        },
        correct: {
          type: Boolean,
          required: true,
        },
      },
    ],

    score: {
      type: Number,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

AttemptSchema.index({ student: 1, room: 1 }, { unique: true });

export default mongoose.model<IAttempt>("Attempt", AttemptSchema);
