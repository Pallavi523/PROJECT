import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCategory,
  getQuestionsByType,
  getAllCategories,
  getQuestionsByCategoryAndType,
} from "../controllers/questionController.js";

const router = express.Router();

router.post("/create-question", createQuestion);

router.get("/get-all-question", getAllQuestions);

router.get("/get-question-by/:id", getQuestionById);

router.put("/update-question/:id", updateQuestion);

router.delete("/delete-question/:id", deleteQuestion);

router.get("/category/:category", getQuestionsByCategory);

router.get("/type/:type", getQuestionsByType);

router.get("/categories", getAllCategories);

router.get("/filter", getQuestionsByCategoryAndType);

export default router;
