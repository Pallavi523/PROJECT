import express from "express";
import assessmentRoutes from "./assessmentRoutes.js";
import authRoutes from "./authRoutes.js";
import questionRoutes from "./questionRoutes.js";
import ResponseRouter from "./responseRouter.js";
import testAttemptRouter from "./testAttemptRoute.js";
import userRoutes from "./userRoutes.js";
import roomRoutes from "./roomRoutes.js";
import candidateRoutes from "./candidateRoutes.js";
const router = express.Router();

router.use("/assessment", assessmentRoutes);
router.use("/auth", authRoutes);
router.use("/question", questionRoutes);
router.use("/response", ResponseRouter);
router.use("/candidates", candidateRoutes);
router.use("/testAttempt", testAttemptRouter);
router.use("/user", userRoutes);
router.use("/websocket", roomRoutes);

export default router;
