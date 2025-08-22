// server/src/routes/tasks.js
import { Router } from "express";
import {
  createTask,
  listTaskForProject, // matches your current controller export name
  // updateTask,      // add when ready
  // deleteTask,      // add when ready
} from "../controllers/taskController.js";

const router = Router();

// nested under a project
router.post("/projects/:id/tasks", createTask);
router.get("/projects/:id/tasks", listTaskForProject);

// when you add these:
// router.put("/tasks/:taskId", updateTask);
// router.delete("/tasks/:taskId", deleteTask);

export default router;
