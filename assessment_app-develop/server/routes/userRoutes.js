import express from "express";
import {
  authenticate,
  adminOnly,
  authorize,
} from "../middleware/authenticate.js";
import {
  addUser,
  changePassword,
  login,
  isAdmin,
  refreshToken,
  getPasswordStatus,
  clearDefaultPassword,
} from "../controllers/userController.js";

const router = express.Router();
router.post("/login", login);
router.post("/add-user", authenticate, isAdmin, addUser);
router.post("/refresh", refreshToken);
router.get("/password-status", authenticate, getPasswordStatus);
router.post("/change-password", authenticate, changePassword);
router.post("/clear-default-password", authenticate, clearDefaultPassword);

export default router;
