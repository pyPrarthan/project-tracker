import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createTask,
  listTasksForProject, // ← make sure this has the “s”
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router();

router.post("/projects/:id/tasks", requireAuth, createTask);
router.get("/projects/:id/tasks", requireAuth, listTasksForProject); // ← use the same name here
router.put("/tasks/:taskId", requireAuth, updateTask);
router.delete("/tasks/:taskId", requireAuth, deleteTask);

export default router;
