import express from "express";
import {
  getUserTodos,
  getTodoById,
  createTodo,
  updateTodo,
  addItemToTodo,
  updateTodoItem,
  deleteTodoItem,
  deleteTodo,
} from "@controllers/toDoList";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

// ✅ CRUD des todos
router.get("/todos/user", protect, getUserTodos); // Récupérer toutes les todos d’un utilisateur
router.get("/todos/:todoId", protect, getTodoById); // Récupérer une todo par ID
router.post("/todos", protect, createTodo); // Créer une todo
router.put("/todos/:todoId", protect, updateTodo); // Modifier une todo
router.delete("/todos/:todoId", protect, deleteTodo); // Supprimer une todo

// ✅ Gestion des items d’une todo
router.post("/todos/:todoId/items", protect, addItemToTodo); // Ajouter un item
router.put("/todos/:todoId/items/:itemId", protect, updateTodoItem); // Modifier un item
router.delete("/todos/:todoId/items/:itemId", protect, deleteTodoItem); // Supprimer un item

export default router;
