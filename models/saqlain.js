const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const saqlainSchema = new mongoose.Schema({
    total_author_story_views:{
        type:Number
    },
    total_author_series_views:{
        type:Number
    },
    total_story_views:{
        type:Number
    },
    total_story_coins:{
        type:Number
    }
});

module.exports = mongoose.model("saqlain",saqlainSchema);