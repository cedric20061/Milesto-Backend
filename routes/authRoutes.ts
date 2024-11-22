import express from "express";
import { register, login, logout, getUserInfo } from "@controllers/authController.js";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getUserInfo)
export default router;
