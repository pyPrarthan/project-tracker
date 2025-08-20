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


