import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, default: 30 },
    instructions: String,
    totalQuestions: Number,
    passingScore: Number,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    category: {
      type: String,
      enum: [
        "JAVA",
        "API",
        "ETL",
        "PYTHON",
        "SQL",
        "SELENIUM",
        "JAVASCRIPT",
        "MANNUAL",
        "Other",
      ],
      default: "Other",
    },
    randomizeQuestions: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
