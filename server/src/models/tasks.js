import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true
        },
        title: {type: String, required: true, minlength: 1, trim: true},
        description: {type: String, default: "", trim: true}, 
        status: {
            type: String, 
            enum: ["todo", "in-progress", "done"], 
            default: "todo", 
            index: true,
        },
        dueDate:{type: Date, default: null, index: true}, 
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    },
    {timestamps: true}
)

// 🔑 Helpful compound indexes
TaskSchema.index({ projectId: 1, status: 1, dueDate: 1, createdAt: -1 });
TaskSchema.index({ createdBy: 1, projectId: 1, createdAt: -1 }); // 👈 new

export default mongoose.model("Task", TaskSchema)