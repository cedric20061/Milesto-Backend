import Goal from "@models/goal";
import { Response } from "express";
import { CustomRequest } from "@types";
import { Types } from "mongoose";
import { sendPushNotification } from "@utils/notifications";
import User from "@models/user";

export const createGoal = async (req: CustomRequest, res: Response) => {
  const {
    title,
    step,
    description,
    category,
    priority,
    targetDate,
    dependencies,
    milestones,
  } = req.body;

  try {
    const userId = req.user?.id;
    const newGoal = new Goal({
      userId,
      title,
      step,
      description,
      category,
      priority,
      targetDate,
      dependencies,
      milestones,
    });

    await newGoal.save();
    res
      .status(201)
      .json({ message: "Goal created successfully", data: newGoal });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating goal", error });
  }
};

// Récupérer tous les objectifs d'un utilisateur
export const getAllGoals = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const goals = await Goal.find({ userId })
      .populate("dependencies", "title status")
      .populate("milestones"); // Inclure les jalons

    res
      .status(200)
      .json({ message: "Goals retrieved successfully", data: goals });
  } catch (error) {
    console.error(req.user);
    res.status(500).json({ message: "Error retrieving goals", error });
  }
};

export const goalReminder = async (req: CustomRequest, res: Response) => {
  try {
    const now = new Date();
    const goals = await Goal.find({
      status: { $ne: "complet" },
    });

    // Regrouper les objectifs par utilisateur
    const goalsByUser: Record<string, typeof goals> = {};
    for (const goal of goals) {
      const userIdStr = goal.userId.toString();
      if (!goalsByUser[userIdStr]) {
        goalsByUser[userIdStr] = [];
      }
      goalsByUser[userIdStr].push(goal);
    }

    const remindersToSend = [];

    for (const [userId, userGoals] of Object.entries(goalsByUser)) {
      const user = await User.findById(userId);
      if (!user || !user.pushSubscription) continue;

      const messages: string[] = [];

      for (const goal of userGoals) {
        const createdAt = goal.createdAt;
        const targetDate = goal.targetDate;

        const totalDuration = targetDate.getTime() - createdAt.getTime();
        const halfDuration = createdAt.getTime() + totalDuration / 2;

        if (now.getTime() >= halfDuration) {
          const remainingMs = targetDate.getTime() - now.getTime();
          const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
          const remainingMilestones = goal.milestones.filter(
            (m) => !m.completed && !m.everyDayAction
          ).length;

          const isLate = remainingMs < 0;
          const message = isLate
            ? `⚠️ "${goal.title}" est en retard de ${Math.abs(
                remainingDays
              )} jour(s). Il reste ${remainingMilestones} étape(s).`
            : `⏳ "${goal.title}" est à mi-chemin de sa date limite. Il reste ${remainingDays} jour(s) et ${remainingMilestones} étape(s).`;

          messages.push(message);
        }
      }

      if (messages.length > 0) {
        const payload = {
          title: "📌 Rappel de vos objectifs",
          body: messages.join("\n"),
          data: {
            userId: user._id,
          },
        };

        remindersToSend.push(
          sendPushNotification(user.pushSubscription, payload)
        );
      }
    }

    await Promise.all(remindersToSend);

    res
      .status(200)
      .json({ message: "Rappels envoyés par utilisateur si nécessaire." });
  } catch (error) {
    console.error("Erreur dans le rappel d'objectif :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors du rappel d'objectif." });
  }
};

// Récupérer un objectif spécifique
export const getGoalById = async (req: CustomRequest, res: Response) => {
  const { goalId } = req.params;

  try {
    const goal = await Goal.findById(goalId)
      .populate("dependencies", "title status")
      .populate("milestones"); // Inclure les jalons

    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Goal retrieved successfully", data: goal });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving goal", error });
  }
};

// Mettre à jour un objectif
export const updateGoal = async (req: CustomRequest, res: Response) => {
  const { goalId } = req.params;
  const {
    title,
    description,
    step,
    category,
    priority,
    status,
    targetDate,
    dependencies,
    milestones,
  } = req.body;

  try {
    // Trouver l'objectif par son ID
    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }
    // 1. Mise à jour des jalons - Mettre everyDayAction à false si le jalon est "complet"
    if (milestones) {
      goal.milestones = milestones;
      goal.milestones = goal.milestones.map((milestone) => {
        if (milestone.status === "complet") {
          return { ...milestone.toObject(), everyDayAction: false }; // Modifie le champ everyDayAction pour les jalons complets
        }
        return milestone;
      }) as Types.DocumentArray<{
        title: string;
        step: number;
        status: "non démarré" | "en cours" | "complet";
        targetDate: NativeDate;
        completed: boolean;
        everyDayAction: boolean;
        description?: string;
      }>;
      goal.markModified("milestones"); // Indiquer à Mongoose que les jalons ont été modifiés
    }

    // 2. Calcul de la progression - calculer le pourcentage de progression
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter(
      (m) => m.status === "complet"
    ).length;
    goal.progress =
      totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    // 3. Mise à jour des autres champs de l'objectif principal
    goal.title = title || goal.title;
    goal.step = step || goal.step;
    goal.description = description || goal.description;
    goal.category = category || goal.category;
    goal.priority = priority || goal.priority;
    goal.status = status || goal.status;
    goal.targetDate = targetDate || goal.targetDate;
    goal.dependencies = dependencies || goal.dependencies;
    goal.updatedAt = new Date(); // Met à jour la date de modification

    // Enregistrement de l'objectif mis à jour
    await goal.save();
    res.status(200).json({ message: "Goal updated successfully", data: goal });
  } catch (error) {
    res.status(500).json({ message: "Error updating goal", error });
  }
};

// Supprimer un objectif
export const deleteGoal = async (req: CustomRequest, res: Response) => {
  const { goalId } = req.params;

  try {
    const goal = await Goal.findByIdAndDelete(goalId);

    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal", error });
  }
};

// Ajouter un nouveau jalon à un objectif
export const addMilestoneToGoal = async (req: CustomRequest, res: Response) => {
  const { goalId } = req.params;
  const { title, step, description, targetDate, status } = req.body;

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    const newMilestone = {
      title,
      step,
      description,
      targetDate: new Date(targetDate),
      status: status || "non démarré",
    };

    goal.milestones.push(newMilestone);
    await goal.save();

    res
      .status(200)
      .json({ message: "Milestone added successfully", data: goal });
  } catch (error) {
    res.status(500).json({ message: "Error adding milestone", error });
  }
};

// Récupérer tous les objectifs d'un utilisateur
export const getAllMilestones = async (req: CustomRequest, res: Response) => {
  const { goalId } = req.params;

  try {
    const goals = await Goal.find({ _id: goalId });

    res.status(200).json({
      message: "Milestones retrieved successfully",
      data: goals[0].milestones,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Milestones", error });
  }
};

// Mettre à jour un jalon spécifique
export const updateMilestone = async (req: CustomRequest, res: Response) => {
  const { goalId, milestoneId } = req.params;
  const { title, step, description, targetDate, status } = req.body;

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) {
      res.status(404).json({ message: "Milestone not found" });
      return;
    }

    milestone.title = title || milestone.title;
    milestone.step = step || milestone.step;
    milestone.description = description || milestone.description;
    milestone.targetDate = targetDate
      ? new Date(targetDate)
      : milestone.targetDate;
    milestone.status = status || milestone.status;

    await goal.save();

    res
      .status(200)
      .json({ message: "Milestone updated successfully", data: goal });
  } catch (error) {
    res.status(500).json({ message: "Error updating milestone", error });
  }
};

// Supprimer un jalon spécifique
export const deleteMilestone = async (req: CustomRequest, res: Response) => {
  const { goalId, milestoneId } = req.params;

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) {
      res.status(404).json({ message: "Milestone not found" });
      return;
    }

    milestone.deleteOne();
    await goal.save();

    res
      .status(200)
      .json({ message: "Milestone deleted successfully", data: goal });
  } catch (error) {
    res.status(500).json({ message: "Error deleting milestone", error });
  }
};
