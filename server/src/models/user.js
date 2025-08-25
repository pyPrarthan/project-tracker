import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, minlength: 2, trim: true},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true},
        passwordHash: {type: String, required: true}, 
        role: {type: String, enum: ['user', 'admin'], default: 'user'},
    },
    {timestamps: true}
)

userSchema.index({email:1}, {unique: true})

export default mongoose.model('User', userSchema)