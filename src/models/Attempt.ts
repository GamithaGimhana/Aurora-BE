import { Schema, model, Document, Types } from "mongoose";

export interface IAttempt extends Document {
  roomId: Types.ObjectId;
  userId: Types.ObjectId;
  answers: {
    questionId: Types.ObjectId;
    answer: string;
    correct: boolean;
  }[];
  score: number;
  timeTakenSeconds?: number;
}

const attemptSchema = new Schema<IAttempt>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "QuizRoom", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        answer: { type: String, required: true },
        correct: { type: Boolean, required: true }
      }
    ],

    score: { type: Number, required: true },
    timeTakenSeconds: { type: Number }
  },
  { timestamps: true }
);

export default model<IAttempt>("Attempt", attemptSchema);
