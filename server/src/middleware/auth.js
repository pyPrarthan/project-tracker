import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const requireAuth = async (req, res, next) => {
    try{
        const header = req.headers.authorization || ""
        const token = header.startsWith("Bearer ") ? header.slice(7) : null

        if(!token){
            return res.status(401).json({message: "Missing token"})
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {id: payload.sub, role: payload.role, name: payload.name}

        const exists = await User.exists({_id: payload.sub})
        
        // Ensuring the user still exists
        if(!exists){
            return res.status(401).json({message: "User no longer exists"})
        }

        next()

    }catch(err){
        return res.status(401).json({message: "Invalid or expired token"})
    }
}