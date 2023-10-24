const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.DATABASE_URI)
    }catch(err){
        console.log("Could not connect to database , error :"+err)
    }
}

module.exports = connectDB