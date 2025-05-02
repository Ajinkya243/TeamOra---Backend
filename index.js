const {connectDB}=require("./db/db.connect");
const {User}=require("./models/User.models");
const express=require('express');
const app=express();
app.use(express.json());
const cors=require('cors');
app.use(cors());
require('dotenv').config();
const port=process.env.PORT;
const jwt=require('jsonwebtoken');
const { Project } = require("./models/Project.models");
const jwt_key=process.env.Jwt_Key;
const bcrypt=require('bcrypt');
const { Team } = require("./models/Team.models");
const { Task } = require("./models/Task.models");


connectDB().then(resp=>console.log('Database connected')).then(()=>{
    app.listen(port,()=>{
        console.log('Express running on',port)
    })
})

const verifyJWT=(req,resp,next)=>{
    const token=req.headers['authorization'];

    if(!token){
        return resp.status(401).json({message:'No token provided.'})
    }
    try{
        const decodedToken=jwt.verify(token,jwt_key);
        req.user=decodedToken;
        next();  
    }
    catch(error){
        return resp.status(402).json({message:"Invalid token"})
    }
}

//verify token api
app.get("/token/verify",verifyJWT,async(req,resp)=>{
    const user=req.user;
    resp.status(200).json(user);
})

app.get("/",(req,resp)=>{
    resp.send("Welcome to TeamOra backend server")
})
//post user api (register)
app.post("/user/add",async(req,resp)=>{
    const{name,email,password}=req.body;
    try{
        const existingUser=await User.findOne({email});
        if(existingUser){
            resp.status(409).json({message:"Email already exist"});
        }
        const bcryptPassword=await bcrypt.hash(password,10);
        const user=new User({name,email,password:bcryptPassword});
        await user.save();
        resp.status(201).json({message:"User saved",user})
    }
    catch(error){
        resp.json({message:"Something went wrong"})
    }
})
//get user list
app.get("/user/list",verifyJWT,async(req,resp)=>{
    try{
        const users=await User.find();
        resp.json(users);
    }
    catch(error){
        resp.status(500).json({message:'Something went wrong'})
    }
})

//login api
app.post("/user/login",async(req,resp)=>{
    const{email,password}=req.body;
    try{
        const user=await User.findOne({email});
    if(user){
        const isMatch=await bcrypt.compare(password,user.password);
        if (!isMatch) {
            return resp.status(401).json({ message: "Invalid credentials" });
          }
        const token=jwt.sign({id:user._id,name:user.name,email:user.email},jwt_key,{expiresIn:"24h"});
        resp.send(token);
    }
    else{
        resp.status(404).json({message:"Invalid credentials"})
    }
    }
    catch(error){
        resp.status(500).json({message:"Something went wrong"})
    }
    
})
//get projects

app.get("/project",async(req,resp)=>{
    try{
        const projects=await Project.find();
        resp.status(200).json(projects)
    }
    catch(error){
        throw Error(error);
    }
})

//get project by given input
app.get("/project/:input",async(req,resp)=>{
    try{
        const input=req.params.input;
        if(!input){
            const projects=await Project.find();
            resp.status(200).json(projects);
        }
        const projects= await Project.find({name:{$regex:input,$options:"i"}});
        resp.status(200).json(projects);
        
    }
    catch(error){
        throw error(error);
    }

    
})

//post project
app.post("/project/add",async(req,resp)=>{
    try{
        const project=new Project(req.body);
        await project.save();
        resp.json(project);
    }
    catch(error){
        resp.status(500).json({message:"Something went wrong"});
    }
})

//post team
app.post("/team/add",async(req,resp)=>{
    try{
        const team=new Team(req.body);
        await team.save();
        resp.json(team);
    }
    catch(error){
        resp.status(500).json({message:"Error occur"})
    }
})

//add team member
app.post("/team/add/user",verifyJWT,async(req,resp)=>{
    const{_id,user}=req.body;
    try{
        const team=await Team.findById(_id);
        if (team.members.includes(user._id)) {
            return resp.status(409).json({ message: "User already in team." });
        }
        team.members.push(user._id);
    }
    catch(error){
        resp.json({message:"Something went wrong."})
    }
})

//add task
app.post("/task/add",async(req,resp)=>{
    try{
        const task=new Task(req.body);
        await task.save();
        resp.json(task);
    }
    catch(error){
        throw Error(error);
    }
})

//get user task
// app.get("/task/user/:id",async(req,resp)=>{
//     try{
//         const id=req.params.id;
//         const tasks=await Task.find({owners:{$in:[id]}}).populate('owners','name email');
//         resp.json(tasks);
//     }
//     catch(error){
//         throw Error(error);
//     }
// })

app.get("/task/user",async(req,resp)=>{
    const {id,status}=req.query;
    try{
        const tasks=await Task.find({owners:{$in:[id]}}).populate('owners','name email');
        if(!status){
            resp.json(tasks);
        }
        else{
            const filteredTasks = tasks.filter(task => task.status === status);
            resp.json(filteredTasks);
        }
        
    }
    catch(error){
        throw Error(error);
    }
})

app.get("/teams",async(req,resp)=>{
    try{
        const teams=await Team.find();
        resp.status(200).json(teams);
    }
    catch(error){
        throw Error(error.message);
    }
})