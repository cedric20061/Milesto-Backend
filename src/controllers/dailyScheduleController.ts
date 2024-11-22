import DailySchedule from "@models/dailySchedule";
import { Request, Response } from "express";
import { CustomRequest } from "@types"; // Import your CustomRequest type

// Créer un emploi du temps pour une journée spécifique
export const createOrUpdateDailySchedule = async (
  req: CustomRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const { date, tasks } = req.body;
  try {
    // Vérifiez s'il existe déjà un emploi du temps pour cet utilisateur et cette date
    const existingSchedule = await DailySchedule.findOne({
      userId,
      date: new Date(date),
    });

    if (existingSchedule) {
      // Si un emploi du temps existe déjà, mettez à jour les tâches
      existingSchedule.tasks = tasks;
      await existingSchedule.save();
      res.status(200).json({
        message: "Daily schedule updated successfully",
        data: existingSchedule,
      });
    } else {
      // Si aucun emploi du temps n'existe, créez un nouvel emploi du temps
      const newSchedule = new DailySchedule({
        userId,
        date,
        tasks,
      });

      await newSchedule.save();
      res.status(201).json({
        message: "Daily schedule created successfully",
        data: newSchedule,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating or updating daily schedule", error });
  }
};
// Récupérer l'emploi du temps d'un utilisateur pour une date spécifique
export const getUserDailySchedule = async (
  req: CustomRequest,
  res: Response
) => {
  const userId = req.user?.id;
  try {
    const schedule = await DailySchedule.find({
      userId,
    });

    if (!schedule) {
      res
        .status(404)
        .json({ message: "No daily schedule found for this date" });
      return;
    }
    res.status(200).json({ data: schedule });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving daily schedule", error });
  }
};

// Récupérer l'emploi du temps d'un utilisateur pour une date spécifique
export const getDailyScheduleByDate = async (
  req: CustomRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const { date } = req.params;

  try {
    const schedule = await DailySchedule.findOne({
      userId,
      date: new Date(date),
    }).populate("tasks.goalId");

    if (!schedule) {
      res
        .status(404)
        .json({ message: "No daily schedule found for this date" });
      return;
    }

    res.status(200).json({ data: schedule });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving daily schedule", error });
  }
};

// Mettre à jour le statut d'une tâche spécifique dans l'emploi du temps
export const updateSchedule = async (req: Request, res: Response) => {
  const { scheduleId } = req.params;
  const updatedFields = req.body;

  try {
    const schedule = await DailySchedule.findById(scheduleId);

    if (!schedule) {
      res.status(404).json({ message: "Daily schedule not found" });
      return;
    }

    Object.keys(updatedFields).forEach((key) => {
      schedule[key] = updatedFields[key];
    });

    await schedule.save();

    res
      .status(200)
      .json({ message: "Schedule updated successfully", data: schedule });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

export const addTaskToSchedule = async (req: Request, res: Response) => {
  const { scheduleId } = req.params;
  const { task } = req.body;
  try {
    const schedule = await DailySchedule.findById(scheduleId);
    if (!schedule) {
      res.status(404).json({ message: "Daily schedule not found" });
      return;
    }

    // Pousser la tâche dans le tableau tasks et récupérer la tâche après l'ajout
    schedule.tasks.push(task);
    await schedule.save();

    // La tâche ajoutée sera maintenant dans le tableau schedule.tasks
    const addedTask = schedule.tasks[schedule.tasks.length - 1];

    res
      .status(200)
      .json({
        message: "Task added successfully",
        data: { id: scheduleId, task: addedTask },
      });
  } catch (error) {
    res.status(500).json({ message: "Error adding task", error });
  }
};

// Mettre à jour le statut d'une tâche spécifique dans l'emploi du temps
export const updateTask = async (req: Request, res: Response) => {
  const { scheduleId } = req.params;
  const { task } = req.body;
  try {
    // Trouver le planning par son ID
    const schedule = await DailySchedule.findById(scheduleId);

    if (!schedule) {
      res.status(404).json({ message: "Daily schedule not found" });
      return
    }

    // Trouver la tâche dans le tableau des tâches du planning
    const scheduleTask = schedule.tasks.id(task._id);

    if (!scheduleTask) {
      res.status(404).json({ message: "Task not found" });
      return
    }

    // Mettre à jour la tâche avec les nouvelles données
    scheduleTask.set(task); // Utilisation de la méthode `set()` pour mettre à jour la tâche avec les nouvelles valeurs

    // Sauvegarder le planning avec la tâche mise à jour
    await schedule.save();

    // Retourner la réponse avec la tâche mise à jour
    res
      .status(200)
      .json({ message: "Task updated successfully", data: {task:scheduleTask, id:scheduleId} });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

// Supprimer un emploi du temps pour une journée spécifique
export const deleteTaskFromDailySchedule = async (
  req: Request,
  res: Response
) => {
  const { scheduleId, taskId } = req.params;

  try {
    const schedule = await DailySchedule.findById(scheduleId);
    if (!schedule) {
      res.status(404).json({ message: "Daily schedule not found" });
      return;
    }

    const task = schedule.tasks.id(taskId);
    if (!task) {
      res.status(404).json({ message: "Task not found in daily schedule" });
      return;
    }

    // Supprimer la tâche spécifique
    task.deleteOne();

    // Sauvegarder le programme après la suppression
    await schedule.save();

    res
      .status(200)
      .json({ message: "Task deleted successfully from daily schedule" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting task from daily schedule", error });
  }
};

// Supprimer un emploi du temps pour une journée spécifique
export const deleteDailySchedule = async (req: Request, res: Response) => {
  const { scheduleId } = req.params;

  try {
    const schedule = await DailySchedule.findByIdAndDelete(scheduleId);

    if (!schedule) {
      res.status(404).json({ message: "Daily schedule not found" });
      return;
    }

    res.status(200).json({ message: "Daily schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting daily schedule", error });
  }
};
