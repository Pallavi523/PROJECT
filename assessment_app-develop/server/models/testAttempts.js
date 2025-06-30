import mongoose from "mongoose";
const testAttemptSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Response" }],
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("TestAttempt", testAttemptSchema);
