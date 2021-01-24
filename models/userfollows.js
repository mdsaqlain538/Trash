const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const userfollowSchema = new mongoose.Schema({
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    },
    source_id:{
        type:String
    },
    target_id:{
        type:String
    }
});

module.exports = mongoose.model("user-follows",userfollowSchema);