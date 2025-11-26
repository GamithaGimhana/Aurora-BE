import { Schema, model, Document, Types } from "mongoose";

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

export interface IFlashcard extends Document {
  noteId: Types.ObjectId;
  ownerId: Types.ObjectId;
  question: string;
  answer: string;
  difficulty: Difficulty;
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: Object.values(Difficulty), default: Difficulty.MEDIUM }
  },
  { timestamps: true }
);

export default model<IFlashcard>("Flashcard", flashcardSchema);
