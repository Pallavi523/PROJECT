import mongoose from "mongoose";
const responseSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    question: {
      type: String,
      required: true,
    },
    subjectiveAnswer: {
      type: String,
      required: false,
    },
    mcqAnswer: {
      type: String,
      required: false,
    },
    codingAnswer: {
      type: String,
      required: false,
    },
    timeTaken: {
      type: Number,
    },
    marks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Response = mongoose.model("Response", responseSchema);

export default Response;
