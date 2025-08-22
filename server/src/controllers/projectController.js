import Project from '../models/projects.js'
import { getReposForProject } from '../../services/githubService.js';
import { getTaskSummaryForProject } from './taskController.js';

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


// export const getProject = async (req, res)=>{
//     const p = await Project.findById(req.params.id)
//     if(!p){
//         return res.status(404).json({error: "Project not found."});
//     }
//     res.json(p);
// }

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

export const getProject = async (req, res)=>{
    try{
        const p = await Project.findById(req.params.id).lean()
        if(!p){
            return res.status(404).json({error: "Project not found."});
        }

        const tasksSummary = await getTaskSummaryForProject(req.params.id)
        return res.json({...p, tasksSummary})

    }catch(err){
        console.error("getProject error",err)
        return res.status(500).json({error: "Failed to fetch project."})
    }
}


// GitHub fetching logic 
export const getProjectGithub =  async (req, res) =>{
    try{
        const {id} = req.params
        const forceRefresh = req.query.forceRefresh === '1' || req.query.forceRefresh === 'true';

        const project = await Project.findById(id)
        if (!project) {
            return res.status(404).json({message: "Project not found."});
        }

        if (!project.githubRepos || project.githubRepos.length === 0) {
            return res.json({projectId: project._id, summary: {total: 0, errors: 0, fromGithub: 0, fromCache: 0}, repos:[]});

        }
        const repos = await getReposForProject(project, {forceRefresh})
        const summary = {
            total: repos.length,
            errors: repos.filter(r => r.error).length,
            fromGithub: repos.filter(r => r.source === 'github').length,
            fromCache: repos.filter(r => r.source === 'github').length
        }
        res.json({projectId: project._id, summary, repos});
    }catch(err){
        console.log(err)
        res.status(500).json({error: "Failed to fetch Github data"});
    }
}