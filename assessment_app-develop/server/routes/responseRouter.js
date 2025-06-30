import {
  createResponse,
  uploadMarks,
  getResponseById,
  deleteResponseById,
  updateResponseById,
  getAllResponses,
} from "../controllers/responseController.js";
import express from "express";

const router = express.Router();

router.post("/create-response", createResponse); 
router.put("/upload-marks", uploadMarks);
router.get("/all-responses", getAllResponses);
router.get("/response-by-id/:id", getResponseById); 
router.delete("/delete-response/:id", deleteResponseById);
router.put("/update-response/:id", updateResponseById); 

export default router;
