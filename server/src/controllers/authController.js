import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const signJwt = (u) =>{
    jwt.sign({sub: u._id.toString(), role: u.role, name: u.name}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN || "1h"} )
}

export const register = async (req, res) =>{
    const {name, email, password} = req.body

    if(!name || !email || !password){
        return res.status(400).json({error: "Name, email and password are required."});
    }

    if(password.length < 8){
        return res.status(400).json({error: "Password must be at least 8 characters long."});
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({name, email, passwordHash})
    const token = signJwt(user)
    return res.status(201).json({user: {id: user._id, name, email, role: user.role}, token})
}

export const login = async(req, res) =>{
    const {email, password} = req.body

    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({error: "User not found."});
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if(!ok){
        return res.status(401).json({error: "Invalid email or password."});
    }

    const token = signJwt(user)
    res.json({user: {id: user._id, name: user.name, email: user.email, role: user.role}, token})
}