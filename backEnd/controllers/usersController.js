const User = require('../models/UserSchema')
const Note = require('../models/NoteSchema')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const getAllUsers = asyncHandler(async(req, res) =>{
    const users = await User.find().select('-user_password').lean()
    if(!users?.length){
        return res.status(400).json({message : 'No user found'})
     }
     res.json(users)
})

const createNewUser = asyncHandler(async(req, res) =>{
    const { username , password , roles } = req.body

    //confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({message : 'All fields are required'}) 
    }

    //check duplicate
    const duplicate = await User.findOne({ user_name : username }).lean().exec()
    
    if(duplicate){
        return res.status(400).json({message : 'Duplicate username found'}) 
    }

    //hashing password
    const hashPwd = await bcrypt.hash(password,10)

    const userObject = {user_name : username , "user_password" : hashPwd , user_roles : roles }
     
    //create and store new user
    const user = await User.create(userObject)

    if(user){//created
        res.status(201).json({message :  `New user ${username} created`})
    }else{
        res.status(400).json({message : 'Invalid User data recieved , couldnt create the user'})
    }
})

const updateUser = asyncHandler(async(req, res) =>{
const { id , username , roles , active , password} = req.body

//confirm data
if(!id || !username  || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
  return res.status(400).json({message : 'All fields are required'})   
}
    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: 'User was not found'})
    }

    //check for duplicate 
    const duplicate = await User.findOne({ user_name : username }).lean().exec()
    //allow updates to the original
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    user.user_name = username
    user.user_roles = roles
    user.active_user = active

    if(password){
        //hash password again
        user.user_password = await bcrypt.hash(password,10)
    }

    const updatedUser = await user.save()

    res.json({message : `User ${updatedUser.user_name} was updated`})
})

const deleteUser = asyncHandler(async(req, res) =>{
const { id } = req.body

if(!id)
{
    return res.status(400).json({message : 'User Id is required'})  
}
    const note = await Note.findOne({ user : id }).lean().exec()
    if(note){
        return res.status(400).json({message : 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message : 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.user_name} with Id ${result._id} deleted`
    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
}