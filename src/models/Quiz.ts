import { Schema, model, Document, Types } from "mongoose";

export interface IQuiz extends Document {
  ownerId: Types.ObjectId; // student or lecturer
  title: string;
  questionIds: Types.ObjectId[];
  visibility: "PRIVATE" | "PUBLIC";
}

const quizSchema = new Schema<IQuiz>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question", required: true }],
    visibility: {
      type: String,
      enum: ["PRIVATE", "PUBLIC"],
      default: "PRIVATE"
    }
  },
  { timestamps: true }
);

export default model<IQuiz>("Quiz", quizSchema);
