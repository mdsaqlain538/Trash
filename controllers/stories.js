const stories = require('../models/stories');


exports.stories = (req,res)=>{
    stories.countDocuments((err,res)=>{
        console.log(res);
    })
}