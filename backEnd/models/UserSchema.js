const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    user_name : {
        type : String,
        required : true
    },
    user_password : {
        type : String,
        required : true
    },
    user_roles:[ {
        type : String,
        default : "Employee"
    }],
    active_user:{
        type : Boolean,
        default : true
    }
})

module.exports = mongoose.model('User' , userSchema)