import express from 'express';
import {
    createOrUpdateDailySchedule,
    getUserDailySchedule,
    getDailyScheduleByDate,
    updateTask,
    deleteDailySchedule,
    deleteTaskFromDailySchedule,
    updateSchedule,
    addTaskToSchedule
} from '@controllers/dailyScheduleController';
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

router.post('/schedules', protect, createOrUpdateDailySchedule);
router.get('/schedules/user', protect, getUserDailySchedule);
router.get('/schedules/user/date/:date', protect, getDailyScheduleByDate);
router.post('/schedules/:scheduleId', protect, addTaskToSchedule);
router.put('/schedules/:scheduleId', protect, updateSchedule);
router.put('/schedules/:scheduleId/:taskId', protect, updateTask);
router.delete('/schedules/:scheduleId', protect, deleteDailySchedule);
router.delete('/schedules/:scheduleId/tasks/:taskId', protect, deleteTaskFromDailySchedule);

export default router;
