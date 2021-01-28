require('dotenv').config()

var express = require('express');
var app = express();
const bodyParser = require('body-parser');

var port = process.env.port || 1234;
//Middle ware..
app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());


//MongoDB connection..
const mongoose = require('mongoose');
const kahanies = require('./models/kahanies');
const transactions = require('./models/transactions');
const { response } = require('express');
mongoose.connect(process.env.DATABASE, 
{useNewUrlParser: true, 
useUnifiedTopology: true,
useCreateIndex:true
}).then(()=>{
    console.log("DB CONNECTED");
});

const stories = require('./models/stories');
const users = require('./models/users');
const Views = require('./models/storyViews');
const Transacation = require('./models/transactions');
const Kahanies = require('./models/kahanies');
const saqlain = require('./models/saqlain');
const comments = require('./models/comments');
const Follows = require('./models/userfollows');
var ObjectId = require('mongodb').ObjectID;


global.g_coins_data = [];
global.g_comments_data = [];

//to get the complete report of the usesr...
app.get('/test',(req,res)=>{
    users.aggregate([
    {
        $project: {
          "user_id": {$toString: "$_id"},
          "full_name":1,
          "phone":1,
          "email":1,
          "followers_count":1,
          "length": { $strLenCP: "$email" },
        }
    },
    {
        $lookup:{
                        from:"kahanies",
                        localField:"user_id",
                        foreignField:"author_id",
                        as:"saqlain"
                    }
    },
    {
        $unwind:"$saqlain"
    },
    {
        $project:{
            "user_id":1,
            "full_name":1,
            "phone":1,
            "email":1,
            "followers_count":1,
            story_views:{
                $cond:{ if: { $eq: [ "$saqlain.type", "story" ] }, then: {$sum:"$saqlain.views_count"}, else: 0}
            },
            series_views:{
                $cond:{ if: { $eq: [ "$saqlain.type", "series" ] }, then: {$sum:"$saqlain.views_count"}, else: 0}
            },
            story_count:{
                $cond:{ if: { $eq: [ "$saqlain.type", "story" ] }, then: {$sum:1}, else: 0}
            },
            series_count:{
                $cond:{ if: { $eq: [ "$saqlain.type", "series" ] }, then: {$sum:1}, else: 0}
            }
        }
    },
    {
        $group:{
            _id:"$_id",
            "story_count":{$sum:"$story_count"},
            "series_count":{$sum:"$series_count"},
            data : {$first : "$$ROOT"}
            //from data--->//1.full_name 2.phone 3.email 4.followers_count 5.story_views 6.series_views.
        }
    }
],(err,result)=>{
    console.log('6-modules data collected...');
    //console.log(result);

    for(let i=0;i<result.length;i++){

        var user_id = result[i].data.user_id;

        //coins_count 
        transactions.aggregate([
            {
                $match:{"user_id":user_id,"transaction_type":"spent"}
            },
            {
                $group:{
                    _id:user_id,
                    author_coins:{$sum:"$coins"}
                }
            }
        ],(err,coins_data)=>{
            if(coins_data.length==0){
                //console.log('No Transaction Found')
                //g_ydata.author_coins=0;
            }else{
                //g_coins_data = coins_data;
                g_coins_data.push({
                    _id:coins_data._id,
                    author_coins:coins_data.author_coins
                })
            }
        })

        //comments count
        stories.aggregate([
            {
                $match:{"author_id":user_id}
            },
            {
                $lookup:{
                    from:"comments",
                    localField:"_id",
                    foreignField:"story_id",
                    as:"salman"
                }
            },
            {
                $group:{
                    _id:user_id,
                    comments_count:{$sum:1}
                }
            }
        ],(err,comments_data)=>{
            if(comments_data.length==0){
                //console.log('No Comment Found')
            }else{
                g_comments_data.push({
                    _id:comments_data._id,
                    comments_count:comments_data.comments_count
                })
            }
        })

        //email the author along with details
        const msg = {
            to: result[i].data.email,
            from: {
                email: 'pallav@kahaniya.com',
                name: 'Pallav Bajjuri'
            },
            cc:'telugu@kahaniya.com',
            dynamic_template_data: {
              full_name:result[i].data.full_name,
              email:result[i].data.email,
              stroy_views_count:result[i].data.Views_Count,
              series_views_count:result[i].data.series_views,
              story_written_count:result[i].story_count,
              series_written_count:result[i].series_count,
              followers_count:result[i].data.followers_count,
              Total_coins:g_coins_data.author_coins,
              Comments_Count:g_comments_data.comments_count
            },
            templateId:'d-979470da14304f689e298abbbbd2638a'
          };

           //ES6 mail functionality.
           //TODO:msg parameter has been removed to avoid unexpected mailing.
            // sgMail
            //     .sendMultiple()
            //     .then(() => {}, error => {
            //     console.error(error);
    
            //     if (error.response) {
            //         console.error(error.response.body)
            //     }
            //     });


    }
  })  
})

app.listen(port);
console.log('server started...')