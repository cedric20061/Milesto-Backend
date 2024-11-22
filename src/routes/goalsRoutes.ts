import express from "express";
import {
  createGoal,
  getAllGoals,
  getAllMilestones,
  getGoalById,
  updateGoal,
  deleteGoal,
  addMilestoneToGoal,
  updateMilestone,
  deleteMilestone,
} from "@controllers/goalsController";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

router.post("/goals", protect, createGoal);
router.get("/goals/user", protect, getAllGoals);
router.get("/goals/:goalId", protect, getGoalById);
router.put("/goals/:goalId", protect, updateGoal);
router.delete("/goals/:goalId", protect, deleteGoal);
router.get("/goals/:goalId/milestones", protect, getAllMilestones);
router.post("/goals/:goalId/milestones", protect, addMilestoneToGoal);
router.put("/goals/:goalId/milestones/:milestoneId", protect, updateMilestone);
router.delete("/goals/:goalId/milestones/:milestoneId", protect, deleteMilestone);

export default router;
