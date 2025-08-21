import Project from '../models/projects.js'
import Task from "../models/tasks.js"

// POST /api/projects/:id/tasks

export const createTask = async (req, res) =>{
    try{
        const {id: projectId} = req.params
        const {title, description ="", status = "todo", dueDate = null} = req.body

        const exists = await Project.exists({_id: projectId})
        if (!exists){
            return res.status(404).json({error: "Project not found"})
        }

        const task = await Task.create({
            projectId,
            title,
            description,
            status,
            dueDate: dueDate ? new Date(dueDate) : null
        })

        return res.status(201).json({task})

    }catch(err){
        return res.status(400).json({error: err.message || "Failed to create Task!"})
    }
}
/*
 * GET /api/projects/:id/tasks
 * Query: status=todo|in-progress|done, q=<search in title>, sort, page, limit
 * sort: dueDate|createdAt|updatedAt|title|status (prefix with "-" for desc)
*/

export const listTaskForProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { status, q, sort = "-createdAt", page = 1, limit = 10 } = req.query;

    const exists = await Project.exists({ _id: projectId });
    if (!exists) return res.status(404).json({ message: "Project not found" });

    const filter = { projectId };
    if (status) filter.status = status;
    if (q) filter.title = { $regex: q, $options: "i" };

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const sortField = sort.replace(/^-/, "");
    const sortDir = sort.startsWith("-") ? -1 : 1;
    const allowed = new Set(["dueDate","createdAt","updatedAt","title","status",]);
    const sortOpt = allowed.has(sortField)
      ? { [sortField]: sortDir }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Task.find(filter).sort(sortOpt).skip((pg - 1) * lim).limit(lim).lean(),Task.countDocuments(filter),
    ]);

    return res.json({
      items,
      page: pg,
      limit: lim,
      total,
      totalPages: Math.ceil(total / lim),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list tasks!" });
  }
};

/* 
    PUT /api/tasks/:taskId
*/

export const updateTask = async (req, res)=>{
    try{
        const {taskId} = req.params
        const updates = {...req.body} // this is copy, ...req.body i.e. spread operator, updates is a shallow copy of req.body

        if("dueDate" in updates){
            updates.dueDate = updates.dueDate ? new Date(updates.dueDate) : null
        }

        const updated = await Task.findByIdAndUpdate(taskId, updates, {
            new: true, 
            runValidators: true,
        })
        
        if(!updated) return res.status(404).json({error: "Task not found"})

        return res.json(updated)
        
    }catch(err){
        return res.status(400).json({error: err.message || "Failed to update Task!"})
    }
}