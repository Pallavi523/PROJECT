import express from "express";
import {
  verifyMagicLink,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/verify/:token", verifyMagicLink);


export default router;
