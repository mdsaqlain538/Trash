const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const userSchema = new mongoose.Schema({
    will_remove_it:{
        type:Number
    },
    full_name:{
        type:String
    },  
    phone:{
        type:Number
    },
    password:{
        type:String
    },
    email:{
        type:String
    },
    country_code:{
        type:String
    },
    is_active:{
        type:Number
    },
    biography:{
        
    },
    image:{
        
    },
    cover_image:{
        
    },
    gender:{
        
    },
    created_at:{
        
    },
    address:{
        type:String
    },
    editors_pick:{
        type:Number,
    },
    role_id:{
        type:Number
    },
    followers_count:{
        type:Number
    },
    followings_count:{
        type:Number
    },
    editor_pick:{
        type:Number
    },
    commission:{
        type:Number
    },
    updated_at:{
        type:Date
    },
    user_name:{
        type:String
    },
    writing_count:{
        type:Number
    },
    referral_code:{
        type:String
    },
    editorUserLanguages:{
        type:Array
    },
    isPaymentEnabled:{
        type:Boolean
    },
    score:{
        
    }
});

module.exports = mongoose.model("Users",userSchema);