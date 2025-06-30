import express from "express";
import {
  createAssessment,
  scheduleCandidate,
  getAssessmentId,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getAllAssessments,
  addQuestionToAssessment,
  getQuestionsFromAssessment,
  removeQuestionFromAssessment,
  addSelectedQuestionsToAssessment,
  getDurationFromAssessment,
  getInstructionFromAssessment,
} from "../controllers/assessmentController.js";

import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-assessment", createAssessment);
router.post("/candidates/schedule-test", scheduleCandidate);
router.get("/:title/id", getAssessmentId);
router.get("/all", getAllAssessments);
router.get("/:id", getAssessmentById);
router.put("/:id", updateAssessment);
router.delete("/:id", deleteAssessment);
router.post("/:assessmentId/question", addQuestionToAssessment);
router.get("/:assessmentId/duration", getDurationFromAssessment);
router.get("/:assessmentId/instructions", getInstructionFromAssessment);
router.get("/:assessmentId/questions", getQuestionsFromAssessment);
router.post("/:assessmentId/questions/bulk-add", addSelectedQuestionsToAssessment);
router.delete(
  "/:assessmentId/question/:questionId",
  removeQuestionFromAssessment
);

router.get("/test-current-status", isAuthenticated, (req, res) => {
  const now = new Date();
  const startTime = new Date(req.user.actualStartTime);
  const timeRemaining = 30 - Math.floor((now - startTime) / 60000);

  res.json({
    timeRemaining,
    assessment: req.user.assessmentId,
    status: req.user.attemptStatus,
  });
});

export default router;
