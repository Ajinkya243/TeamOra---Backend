const mongoose=require('mongoose');
require('dotenv').config();
const mongoUrl=process.env.MONGODB;

const connectDB=()=>{
    return mongoose.connect(mongoUrl);
}
module.exports={connectDB}