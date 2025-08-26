import Task from "../models/tasks.js";
import Project from "../models/projects.js";

export const createTask = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (req.user.role !== "admin" && String(project.createdBy) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  const { title, description, status, dueDate } = req.body;
  const task = await Task.create({
    projectId: project._id,
    title,
    description,
    status,
    dueDate,
    createdBy: req.user.id,
  });
  res.status(201).json(task);
};

export const listTasksForProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (req.user.role !== "admin" && String(project.createdBy) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });
  const tasks = await Task.find({ projectId: project._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(tasks);
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });
  const project = await Project.findById(task.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (req.user.role !== "admin" && String(project.createdBy) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  Object.assign(task, req.body);
  await task.save();
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });
  const project = await Project.findById(task.projectId);
  if (req.user.role !== "admin" && String(project.createdBy) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  await task.deleteOne();
  res.json({ ok: true });
};
