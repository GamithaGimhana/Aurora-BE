import { Schema, model, Document, Types } from "mongoose";

export interface INote extends Document {
  ownerId: Types.ObjectId;
  title: string;
  topic: string;
  content: string;
  sourcePdfUrl?: string;
}

const noteSchema = new Schema<INote>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    content: { type: String, required: true },
    sourcePdfUrl: { type: String }
  },
  { timestamps: true }
);

export default model<INote>("Note", noteSchema);
