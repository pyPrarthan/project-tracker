import mongoose from "mongoose";
import Project from "../models/projects.js";
import Task from "../models/tasks.js";
import { getReposForProject } from "../../services/githubService.js";

// local helper to avoid circular import
const getTaskSummaryForProject = async (projectId) => {
  const counts = await Task.aggregate([
    { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const summary = { todo: 0, inProgress: 0, done: 0, total: 0 };
  for (const { _id, count } of counts) {
    if (_id === "todo") summary.todo = count;
    if (_id === "in-progress") summary.inProgress = count;
    if (_id === "done") summary.done = count;
    summary.total += count;
  }
  return summary;
};

// Optional: small helper to keep checks DRY
const isOwnerOrAdmin = (project, user) =>
  user?.role === "admin" || String(project.createdBy) === user?.id;

/** POST /api/projects */
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description = "",
      status = "planned",
      githubRepos = [],
    } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        error:
          "Project name is required and must be at least 3 characters long.",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description,
      status,
      githubRepos,
      createdBy: req.user.id, // 👈 enforce ownership
    });

    return res.status(201).json(project);
  } catch (err) {
    console.error("createProject error:", err);
    return res.status(400).json({ error: err.message });
  }
};

/** GET /api/projects */
export const listProjects = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(projects);
  } catch (err) {
    console.error("listProjects error:", err);
    return res.status(500).json({ error: "Failed to list projects." });
  }
};

/** GET /api/projects/:id */
export const getProject = async (req, res) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Project not found." });

    if (!isOwnerOrAdmin(p, req.user))
      return res.status(403).json({ message: "Forbidden" });

    // build tasks summary (using your existing helper)
    const tasksSummary = await getTaskSummaryForProject(p._id.toString());
    return res.json({ ...p.toObject(), tasksSummary });
  } catch (err) {
    console.error("getProject error:", err);
    return res.status(500).json({ error: "Failed to fetch project." });
  }
};

/** PUT /api/projects/:id */
export const updateProject = async (req, res) => {
  try {
    const { name, description, status, githubRepos } = req.body;

    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Project not found." });

    if (!isOwnerOrAdmin(p, req.user))
      return res.status(403).json({ message: "Forbidden" });

    if (name && name.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "Project name must be at least 3 characters long." });
    }

    p.name = name ?? p.name;
    p.description = description ?? p.description;
    p.status = status ?? p.status;
    p.githubRepos = githubRepos ?? p.githubRepos;

    await p.save();
    return res.json(p);
  } catch (err) {
    console.error("updateProject error:", err);
    return res.status(500).json({ error: "Failed to update project." });
  }
};

/** DELETE /api/projects/:id */
export const deleteProject = async (req, res) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Project not found." });

    if (!isOwnerOrAdmin(p, req.user))
      return res.status(403).json({ message: "Forbidden" });

    await p.deleteOne();
    return res.json({ ok: true, message: "Project deleted successfully." });
  } catch (err) {
    console.error("deleteProject error:", err);
    return res.status(500).json({ error: "Failed to delete project." });
  }
};

/** GET /api/projects/:id/github */
export const getProjectGithub = async (req, res) => {
  try {
    const { id } = req.params;
    const forceRefresh =
      req.query.forceRefresh === "1" || req.query.forceRefresh === "true";

    const project = await Project.findById(id);
    if (!project)
      return res.status(404).json({ message: "Project not found." });

    if (!isOwnerOrAdmin(project, req.user))
      return res.status(403).json({ message: "Forbidden" });

    if (!project.githubRepos || project.githubRepos.length === 0) {
      return res.json({
        projectId: project._id,
        summary: { total: 0, errors: 0, fromGithub: 0, fromCache: 0 },
        repos: [],
      });
    }

    const repos = await getReposForProject(project, { forceRefresh });

    const summary = {
      total: repos.length,
      errors: repos.filter((r) => r.error).length,
      fromGithub: repos.filter((r) => r.source === "github").length,
      fromCache: repos.filter((r) => r.source === "cache").length, // ✅ fix
    };

    return res.json({ projectId: project._id, summary, repos });
  } catch (err) {
    console.error("getProjectGithub error:", err);
    return res.status(500).json({ error: "Failed to fetch GitHub data." });
  }
};
