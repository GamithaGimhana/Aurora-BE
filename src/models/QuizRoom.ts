import mongoose, { Document, Schema } from "mongoose";

export interface IQuizRoom extends Document {
  _id: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  code: string;
  lecturer: mongoose.Types.ObjectId;
  duration: number; // minutes
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const quizRoomSchema = new Schema<IQuizRoom>(
  {
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    code: { type: String, required: true, unique: true },
    lecturer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    duration: { type: Number, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IQuizRoom>("QuizRoom", quizRoomSchema);
