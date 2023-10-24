const Note = require('../models/NoteSchema')
const User = require('../models/UserSchema')
const asyncHandler = require('express-async-handler')

const getAllNotes = asyncHandler(async(req, res) =>{
    const notes = await Note.find().lean()
    if(!notes?.length){
        return res.status(400).json({message : 'No notes found'})
     }
     // Add username to each note before sending the response
     //mapping script
     const notesWithUser =  await Promise.all(notes.map(async (note) =>{
        const user = await User.findById(note.user).lean().exec()
        return { ...note , username : user.user_name}
     }))
     res.json(notesWithUser)
})

const createNewNotes = asyncHandler(async(req,res) =>{
    const {user , noteTitle , noteText} = req.body

    if(!user || !noteTitle || !noteText){
        return res.status(400).json({message : 'All fields for notes are required'})
    }

    //check for duplicate
    const duplicate = await Note.findOne({note_title : noteTitle}).lean().exec()

    if(duplicate){
        return res.status(409).json({message : 'Duplicate note title'})
    }

    //create and store new notes
    const notesObject = {user , note_title : noteTitle , note_text : noteText}

    const notes = await Note.create(notesObject)

    if(notes){
       return res.status(201).json({message : 'New Note created'})
    }else{
        return res.status(400).json({message : 'Invalid Notes data recieved , couldnt create the note'})
    }
})

const updateNotes =  asyncHandler(async(req,res) =>{ 
    const {id , user , noteTitle , noteText , completed} = req.body

    //confirm data
    if(!id || !user || !noteTitle|| !noteText || typeof completed !== 'boolean'){
        return res.status(400).json({ message: 'All fields are required' })
    }

    //confirm notes exist to update
    const notes = await Note.findById(id).exec()

    if(!notes){
        return res.status(400).json({ message: 'Note not found' })
    }

    //check for duplicate title
    const duplicate = await Note.findOne({note_title : noteTitle}).lean().exec()

    if(duplicate){
       return res.status(409).json({message : 'Duplicate Note title'})
    }

    notes.user = user
    notes.note_title = noteTitle
    notes.note_text = noteText
    notes.completed = completed

    const updatedNotes = await notes.save()

    res.json(`'${updatedNotes.note_title}' updated`)
})

const deleteNotes =  asyncHandler(async(req,res) =>{ 
    const {id} = req.body

    //confirms data
    if(!id){
        return res.status(400).json({message : 'Note Id is required'})
    }

    //confirn note exists for delete
    const notes = await Note.findById(id).exec()

    if(!notes){
        return res.status(400).json({ message : 'Note was not found'})
    }

    const result = await notes.deleteOne()

    const reply = `Note '${result.note_title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNotes,
    updateNotes,
    deleteNotes,
}