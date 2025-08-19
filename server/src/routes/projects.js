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

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// NEW  
router.get("/:id/github", getProjectGithub);


export default router;
