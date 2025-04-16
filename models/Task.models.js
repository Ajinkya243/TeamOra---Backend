const mongoose=require('mongoose');

const taskSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    project:{
        type:mongoose.Schema.ObjectId,
        ref:'Project',
        required:true
    },
    team:{
        type:mongoose.Schema.ObjectId,
        ref:'Team'
    },
    owners:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }],
    tags:[{
        type:'String'
    }],
    timeToComplete:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['To Do','In Progress','Completed','Blocked'],
        default:'To Do'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

taskSchema.pre('save',function(next){
    this.updatedAt=Date.now();
    next();
})

const Task=mongoose.model('Task',taskSchema);

module.exports={Task}