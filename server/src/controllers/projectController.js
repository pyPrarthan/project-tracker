import Project from '../models/projects.js'

export const createProject = async (req, res)=>{
    try{
        const {name, description = '', status = 'planned', githubRepos = []} = req.body
        if (!name || name.length < 3) {
            return res.status(400).json({error: "Project name is required and must be at least 3 characters long."});
        }
        const project = await Project.create({name, description, status, githubRepos})
        res.status(201).json(project)

    }catch(err){
        res.status(400).json({error: err.message});
    }
}

export const listProjects = async(req, res)=>{
    const projects = await Project.find().sort({createdAt: -1})
    res.json(projects)
}


export const getProject = async (req, res)=>{
    const p = await Project.findById(req.params.id)
    if(!p){
        return res.status(404).json({error: "Project not found."});
    }
    res.json(p);
}

export const updateProject = async (req, res)=>{
    const {name, description, status, githubRepos} = req.body
    const p = await Project.findByIdAndUpdate(
        req.params.id, 
        {$set: {name, description, status, githubRepos}}, 
        {new: true, runValidators: true}
    )
    if(!p){
        return res.status(404).json({error: "Project not found."});
    }
    res.json(p);
}

export const deleteProject = async (req, res)=>{
    const p = await Project.findByIdAndDelete(req.params.id)
    if (!p){
        return res.status(404).json({error: "Project not found."});
    }
    res.json({ok: true, message: "Project deleted successfully."});
}