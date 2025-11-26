import { Schema, model, Document, Types } from "mongoose";

export interface IQuizRoom extends Document {
  code: string;
  lecturerId: Types.ObjectId;
  quizId: Types.ObjectId;
  durationMinutes: number;
  maxQuestions: number;
  startTime?: Date;
  isActive: boolean;
}

const quizRoomSchema = new Schema<IQuizRoom>(
  {
    code: { type: String, required: true, unique: true },
    lecturerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    durationMinutes: { type: Number, required: true },
    maxQuestions: { type: Number, required: true },
    startTime: { type: Date },

    isActive: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IQuizRoom>("QuizRoom", quizRoomSchema);
