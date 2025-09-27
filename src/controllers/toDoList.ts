import { Response } from "express";
import TodoList from "@models/toDoList";
import { CustomRequest } from "@types";

/**
 * ✅ Récupérer toutes les todos d'un utilisateur
 */
export const getUserTodos = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const todos = await TodoList.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch todos." });
  }
};

/**
 * ✅ Récupérer une todo par ID
 */
export const getTodoById = async (req: CustomRequest, res: Response) => {
  try {
    const { todoId } = req.params;
    const todo = await TodoList.findOne({
      _id: todoId,
      userId: req.user?.id,
    });

    if (!todo) {
      res.status(404).json({ error: "Todo not found." });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch todo." });
  }
};

/**
 * ✅ Créer une nouvelle todo
 */
export const createTodo = async (req: CustomRequest, res: Response) => {
  try {
    const { name, description, color, items } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const newTodo = new TodoList({
      userId,
      name,
      description,
      items,
      color,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create todo." });
  }
};

/**
 * ✅ Modifier une todo (titre, description, couleur, etc.)
 */
export const updateTodo = async (req: CustomRequest, res: Response) => {
  try {
    const { todoId } = req.params;
    const updated = await TodoList.findOneAndUpdate(
      { _id: todoId, userId: req.user?.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ error: "Todo not found." });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to update todo." });
  }
};

/**
 * ✅ Ajouter un item à une todo
 */
export const addItemToTodo = async (req: CustomRequest, res: Response) => {
  try {
    const { todoId } = req.params;
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required." });
      return;
    }

    const todo = await TodoList.findOneAndUpdate(
      { _id: todoId, userId: req.user?.id },
      {
        $push: {
          items: { title, completed: false, createdAt: new Date() },
        },
      },
      { new: true }
    );

    if (!todo) {
      res.status(404).json({ error: "Todo not found." });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to add item." });
  }
};

/**
 * ✅ Mettre à jour un item d'une todo (par exemple cocher comme terminé)
 */
export const updateTodoItem = async (req: CustomRequest, res: Response) => {
  try {
    const { todoId, itemId } = req.params;
    const { title, completed } = req.body;

    const todo = await TodoList.findOneAndUpdate(
      { _id: todoId, userId: req.user?.id, "items._id": itemId },
      {
        $set: {
          "items.$.title": title,
          "items.$.completed": completed,
        },
      },
      { new: true }
    );

    if (!todo) {
      res.status(404).json({ error: "Item not found." });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to update item." });
  }
};

/**
 * ✅ Supprimer un item d'une todo
 */
export const deleteTodoItem = async (req: CustomRequest, res: Response) => {
  try {
    const { todoId, itemId } = req.params;

    const todo = await TodoList.findOneAndUpdate(
      { _id: todoId, userId: req.user?.id },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!todo) {
      res.status(404).json({ error: "Todo or item not found." });
      return;
    }
    res.status(200).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete item." });
  }
};

/**
 * ✅ Supprimer une todo
 */
export const deleteTodo = async (req: CustomRequest, res: Response) => {
  try {
    const { todoId } = req.params;

    const deleted = await TodoList.findOneAndDelete({
      _id: todoId,
      userId: req.user?.id,
    });

    if (!deleted) {
      res.status(404).json({ error: "Todo not found." });
      return;
    }
    res.status(200).json({ message: "Todo deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete todo." });
  }
};
