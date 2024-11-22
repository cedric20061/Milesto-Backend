import express from "express";
import { updateUserProfile, deleteUserAccount, passwordForgotten } from "@controllers/userController";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.put("/profile", protect, updateUserProfile);
router.delete("/account", protect, deleteUserAccount);
router.put("/password", passwordForgotten);
export default router;