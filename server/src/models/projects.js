import mongoose from "mongoose";

const RepoCacheSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // "owner/name"
  etag: { type: String, default: null },
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
  fetchedAt: { type: Date, default: null }
}, { _id: false });

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3 },
    description: { type: String, default: "" },
    status: { type: String, enum: ["planned", "active", "done"], default: "planned" },
    githubRepos: [{ type: String }], // e.g. "pyPrarthan/github-profile-analyzer"
    repoCache: { type: [RepoCacheSchema], default: [] },    // ⬅️ add this
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } 
  },
  { timestamps: true }
);

// 🔑 Index to speed up "all projects for user" queries
ProjectSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Project", ProjectSchema);
