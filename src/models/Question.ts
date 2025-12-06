import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  topic: string;
  user: mongoose.Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, required: true },
    explanation: { type: String },
    topic: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);


export default mongoose.model<IQuestion>("Question", questionSchema);
