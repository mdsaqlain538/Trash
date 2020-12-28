const mongoose = require('mongoose');
//const {ObjectId} = mongoose.Schema;

const transactionsSchema = new mongoose.Schema({
    currency:{
        type:String
    },
    kahani_id:{
        type:String
    },
    product_type:{
        type:String
    },
    user_id:{
        type:String
    },
    transaction_type:{
        type:String
    },
    coins:{
        type:Number
    },
    is_settled:{
        type:Boolean
    }
},{timestamps:true});

module.exports = mongoose.model("transactions",transactionsSchema);