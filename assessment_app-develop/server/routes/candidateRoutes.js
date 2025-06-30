import express from "express";
import {
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getCandidatesByAssessment,
  getCandidatesByStatus,
  startAssessment,
  completeAssessment,
  getFilteredCandidates,
  Warnings,
} from "../controllers/candidateController.js";

const router = express.Router();

router.get("/all", getAllCandidates);
router.get("/:id", getCandidateById);
router.put("/:id", updateCandidate);
router.delete("/:id", deleteCandidate);

// Assessment-specific routes
router.get("/assessment/:assessmentId", getCandidatesByAssessment);
router.get("/status/:attemptStatus", getCandidatesByStatus);
router.post("/:id/start", startAssessment);
router.post("/:id/complete", completeAssessment);
router.post("/proctor-warnings", Warnings);
 

// Filtered search
router.get("/search/filter", getFilteredCandidates);

export default router;
