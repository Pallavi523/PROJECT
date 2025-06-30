import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ text: String, isCorrect: Boolean, _id: false }],
  type: {
    type: String,
    enum: ["MCQ", "Subjective", "Coding"],
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Core_Java",
      "API",
      "ETL",
      "PYTHON",
      "SQL",
      "SELENIUM",
      "MANNUAL",
      "JAVASCRIPT",
      "Other",
    ],
    default: "Other",
  },
});

export default mongoose.model("Question", questionSchema);
