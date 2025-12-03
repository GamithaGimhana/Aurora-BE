import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    explanation: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
