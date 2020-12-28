const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const kahaniesSchema = new mongoose.Schema({
    author_id:{
        type:String
    },
    type:{
        type:String
    },
    title:{
        type:String
    },
    title_id:{
        type:String
    },
    tag_line:{
        type:String
    },
    cover_image:{
        type:String
    },
    preface:{
    
    },
    keywords:{
        type:String
    },
    genere:{
        type:String
    },
    language:{
        type:String
    },
    copy_rights:{
        type:String
    },
    dedicated_to_summary:{
        type:String
    },
    writing_style:{
        type:String
    },
    editor_pick:{
        type:Boolean
    },
    is_active:{
        type:Number
    },
    created_at:{
        type:Date
    },
    will_remove_it:{
        type:Number
    },
    publish_date:{
        type:Date
    },
    views_count:{
        type:Number
    }
});

module.exports = mongoose.model("kahanies",kahaniesSchema);