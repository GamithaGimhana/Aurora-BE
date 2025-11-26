import { Schema, model, Document } from "mongoose";

export enum Role {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER"
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: [String], enum: Object.values(Role), required: true }
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
