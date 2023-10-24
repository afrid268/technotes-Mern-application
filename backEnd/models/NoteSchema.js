const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const noteSchema = new mongoose.Schema(
    {
    user: {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    note_title : {
        type : String,
        required : true
    },
    note_text :{
        type : String,
        required : true
    },
    completed:{
        type : Boolean,
        default : false
    }
} ,
{
    timestamps : true
} 
)

noteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 100,
})

module.exports = mongoose.model('Note' , noteSchema)