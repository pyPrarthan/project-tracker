import mongoose from "mongoose";


const RepoCacheSchema = new mongoose.Schema({
    fullName : {type: String, required: true}, 
    etag: {type: String, default: null}, 
    data: {
        name: String, 
        description: String, 
        homepage: String, 
        defaultBranch: String, 
        stars: Number, 
        forks: Number, 
        openIssues: Number, 
        lastCommitDate: Date, 
        pushedAt: Date,
        updatedAt: Date
    },
    fetchedAt: {type: Date, default: null}
},{_id: false})

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