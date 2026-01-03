import mongoose, { Document, Schema } from "mongoose";

export interface IQuizRoom extends Document {
  _id: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  roomCode: string;
  lecturer: mongoose.Types.ObjectId;
  timeLimit: number; // minutes
  maxAttempts: number;   
  startsAt?: Date;  
  endsAt?: Date;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const quizRoomSchema = new Schema<IQuizRoom>(
  {
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    roomCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    lecturer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timeLimit: { type: Number, required: true },
    maxAttempts: { type: Number, default: 1 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IQuizRoom>("QuizRoom", quizRoomSchema);
