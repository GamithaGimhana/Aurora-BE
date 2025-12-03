import mongoose, { Document, Schema } from "mongoose";

export interface IFlashcard extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  topic: string;
  user: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    topic: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IFlashcard>("Flashcard", flashcardSchema);
