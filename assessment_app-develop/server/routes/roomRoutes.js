import express from "express";
import {
  createRoom,
  getRoomDetails,
  updateCandidateStatus,
  getCandidatesByAssessment,
  getAllRooms,
} from "../controllers/roomController.js";

const router = express.Router();
router.post("/room/create", createRoom);
router.get("/room/:roomId", getRoomDetails);
router.get("/rooms", getAllRooms);
router.patch("/room/:roomId/candidate/:candidateId", updateCandidateStatus);
router.get("/assessment/:assessmentId/candidates", getCandidatesByAssessment);

export default router;
