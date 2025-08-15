import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import projectRoutes from "./routes/projects.js";

const app = express()
app.use(cors())
app.use(express.json())

// Health 
app.get('/health', (req, res)=>{
    res.json({ok: true, uptime: process.uptime()})
})


// Routes
app.use('/api/projects', projectRoutes)

const PORT = process.env.PORT || 4000 
const MONGO_URI = process.env.MONGO_URI

async function start(){
    try{
        await mongoose.connect(MONGO_URI)
        console.log("✅ Mongo connected")
        app.listen(PORT, ()=>{
            console.log(`✅ API on http://localhost:${PORT}`);
        })

    }catch(err){
        console.error("Mongo Connect error: ", err.message)
        process.exit(1)
    }
}


start()