import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    type: {
      type: String,
      enum: ["hr", "technical", "coding"],
      required: true
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },
    questions: [String],
    answers: [String],
    score: Number,
    suggestions: String
  },
  { timestamps: true }
);

export default mongoose.model("Attempt", attemptSchema);
