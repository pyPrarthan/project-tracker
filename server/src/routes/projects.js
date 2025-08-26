// server/src/routes/projects.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectGithub,
} from "../controllers/projectController.js";

const router = Router();

// All project routes require auth
router.post("/", requireAuth, createProject);
router.get("/", requireAuth, listProjects);
router.get("/:id", requireAuth, getProject);
router.put("/:id", requireAuth, updateProject);
router.delete("/:id", requireAuth, deleteProject);

// GitHub cache/fetch for a project (also protected)
router.get("/:id/github", requireAuth, getProjectGithub);

export default router;
