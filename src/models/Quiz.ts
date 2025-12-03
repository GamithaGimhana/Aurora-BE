import mongoose, { Document, Schema } from "mongoose";

export interface IQuiz extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  topic: string;
  user: mongoose.Types.ObjectId;
  questions: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    topic: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }]
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>("Quiz", quizSchema);
