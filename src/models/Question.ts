import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestion extends Document {
  question: string;
  options: string[];
  answer: string;
  topic?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length >= 2, "At least two options required"],
    },
    answer: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", QuestionSchema);
