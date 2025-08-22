// server/src/routes/projects.js
import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectGithub,
} from "../controllers/projectController.js";

const router = Router();

router.post("/", createProject);
router.get("/", listProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get("/:id/github", getProjectGithub);

export default router;
