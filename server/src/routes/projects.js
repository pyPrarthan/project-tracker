import { Router } from "express";
import {
  createTask,
  listTasksForProject,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router();

// nested (by project)
router.post("/projects/:id/tasks", createTask);
router.get("/projects/:id/tasks", listTasksForProject);

// by task id
router.put("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);

export default router;
