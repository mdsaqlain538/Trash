const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const storieSchema = new mongoose.Schema({
    title:{
        type:String
    },
    Kahani_id:{
        type:String
    },  
    no_of_words:{
        type:Number
    },
    cover_image:{
        type:String
    },
    author_id:{
        type:String
    },
    main_content:{
        type:String
    },
    tag_line:{
        
    },
    created_at:{
        type:Date
    },
    is_active:{
        type:Number
    },
    title_id:{
        type:String
    },
    will_remove_it:{
        type:Number
    },
    views_count:{
        type:Number
    },
    publish_date:{
        type:Date
    }
});

module.exports = mongoose.model("stories",storieSchema);