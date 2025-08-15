import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, minlength: 3}, 
        description: {type: String, default: ""}, 
        status: {type: String, enum: ['planned', 'active', 'done'], default: 'planned'}, 
        githubRepos: [{type: String}] //eg 'pyPrarthan/github-profile-analyzer'
    }, 
    { timestamps: true }
)

export default mongoose.model("Project", ProjectSchema);