const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const storyViewSchema = new mongoose.Schema({
    created_at:{
        type:Date
    },
    story_id:{
        type:String
    },
    user_id:{

    },
    will_remove_it:{
        type:Number
    }
});

module.exports = mongoose.model("story-views",storyViewSchema);