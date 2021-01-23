const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    created_at:{
        type:Date
    },
    is_active:{
        type:Number
    },
    story_id:{
        type:String
    },
    user_id:{
        type:String
    },
    content:{
        type:String
    },
    updated_at:{
        type:Date
    },
    will_remove_it:{
        type:Number
    }
});

module.exports = mongoose.model("comments",commentSchema);