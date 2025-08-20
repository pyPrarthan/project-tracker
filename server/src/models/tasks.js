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
            enum: ["todo", "in-progess", "done"], 
            default: "todo", 
            index: true,
        },
        dueDate:{type: Date, default: null, index: ture}, 
    },
    {timestamps: true}
)

// Helpful compuond index for common queries
TaskSchema.index({projectId: 1, status: 1, dueDate: 1, createdAt: -1})

export default mongoose.model("Task", TaskSchema)