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
  submittedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>({
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
    default: Date.now,
  },
});

export default mongoose.model<IAttempt>("Attempt", AttemptSchema);
