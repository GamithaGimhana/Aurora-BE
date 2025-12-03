import mongoose, { Document, Schema } from "mongoose";

export interface IAttempt extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  quizRoom: mongoose.Types.ObjectId;
  responses: {
    question: mongoose.Types.ObjectId;
    selected: string;
    correct: boolean;
  }[];
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const attemptSchema = new Schema<IAttempt>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizRoom: { type: Schema.Types.ObjectId, ref: "QuizRoom", required: true },
    responses: [
      {
        question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        selected: { type: String, required: true },
        correct: { type: Boolean, required: true }
      }
    ],
    score: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IAttempt>("Attempt", attemptSchema);
