import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  user: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model<INote>("Note", noteSchema);
