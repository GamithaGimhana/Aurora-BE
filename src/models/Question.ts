import { Schema, model, Document, Types } from "mongoose";

export enum QuestionType {
  MCQ = "MCQ",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT = "SHORT"
}

export interface IQuestion extends Document {
  text: string;
  choices?: string[];
  correctIndex?: number;
  type: QuestionType;
  quizId?: Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },

    choices: [{ type: String }],
    correctIndex: { type: Number },

    type: {
      type: String,
      enum: Object.values(QuestionType),
      required: true
    },

    quizId: { type: Schema.Types.ObjectId, ref: "Quiz" }
  },
  { timestamps: true }
);

export default model<IQuestion>("Question", questionSchema);
