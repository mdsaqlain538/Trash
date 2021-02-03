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

//<<-------------------------------Daily Repot--------------------------------->>
//<<--------------------------------------------------------------------------->>

//:TODO:: 1.story_views 2.story_count 3.series_views 4.series_count 5.commnets_count 6.follwers 7.coins

//<<--------------------------------------------------------------------------->>
//<<-------------------------------Daily Repot--------------------------------->>

app.get('/test',(req,res)=>{


    var start_date = new Date(req.body.start);
    var end_date = new Date(req.body.end);


    start_date = start_date.setHours(0,0,0);
    end_date =  end_date.setHours(23,59,59);

    users.aggregate([
        {
            $project: {
              user_id: {$toString: "$_id"},
              "full_name":1,
              "phone":1,
              "email":1,
              "length": { $strLenCP: "$email" }
            }
        }
        ],(err,result)=>{

            //code for author coins count --done
            for(let i=0;i<result.length;i++){
                
                var user_id = result[i].user_id;
                //var user_id = '5e53a7e09f81f00d34624006';

                //console.log(user_id);
            
                //story-count ---done
                kahanies.aggregate([
                    {
                        $match:{
                            "author_id":"5e53a7d69f81f00d34621820",
                            type:"story"
                        }
                    },
                    {
                        $lookup:{
                            from:"stories",
                            localField:"author_id",
                            foreignField:"author_id",
                            as:"kahani_story"
                        }
                    },
                    // {
                    //     $match:{
                    //         "created_at":{"$gte": start_date , "$lte":end_date}
                    //     }
                    // },
                    {
                            $project: {
                                _id:"$author_id",          
                                "story_count" : {$size:"$kahani_story"}
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                data : {$first : "$$ROOT"}
                            }
                        }
                ],(err,stories_count)=>{
                    //console.log(stories_count);
                })

                //series-count ---done
                kahanies.aggregate([
                    {
                        $match:{
                            "author_id":"5e53a7d69f81f00d34621820",
                            type:"series"
                        }
                    },
                    {
                        $lookup:{
                            from:"stories",
                            localField:"author_id",
                            foreignField:"author_id",
                            as:"kahani_series"
                        }
                    },
                    {
                        $match:{
                            "created_at":{"$gte": start_date , "$lte":end_date}
                        }
                    },
                    {
                            $project: {
                                _id:"$author_id",          
                                "story_count" : {$size:"$kahani_series"}
                            }
                        },
                        {
                            $group:{
                                _id:null,
                                data : {$first : "$$ROOT"}
                            }
                        }
                ],(err,stories_count)=>{
                    if(stories_count.length==0){
                        //no series for the author..
                    }else{
                    //console.log("series-count:"+stories_count);
                    }
                })

                //story-view    ---need to update
                kahanies.aggregate([
                    {
                        $match:{
                            "author_id":"5e53a7d69f81f00d34621820",
                            type:"story"
                        }
                    },
                    {
                        $lookup:{
                            from:"stories",
                            localField:"author_id",
                            foreignField:"author_id",
                            as:"kahani_story"
                        }
                    },
                    { 
                        $unwind:"$kahani_story"
                    } 
                ],(err,data)=>{

                    console.log('in data');

                    for(let i=0;i<data.length;i++){

                        var story_Object_id = data[i].kahani_story._id;
                        var story_id_string = story_Object_id.toString();
                        console.log(story_id_string);

                        stories.aggregate([
                            {
                                $lookup:{
                                    from:"story-views",
                                    localField:"story_id",
                                    foreignField:"story_id",
                                    as:'author_storyviews'
                                }
                            },{
                                $unwind:'$author_storyviews'
                            },
                            {
                                $match:{
                                    "created_at":{"$gte": start_date , "$lte":end_date}
                                }
                            },
                            {
                                $group:{_id:"$story_id",view_count:{$sum:1}}
                            },
                            {
                                $group:{
                                _id:null,
                                total:{
                                    $sum:"$view_count"
                                }
                                }
                            }
                        ],(err,story_daily_views)=>{
                            console.log(story_daily_views);
                        })
                    }
                })

                //series-views --need to update
                kahanies.aggregate([
                    {
                        $match:{
                            "author_id":"5e53a7d69f81f00d34621820",
                            type:"series"
                        }
                    },
                    {
                        $lookup:{
                            from:"stories",
                            localField:"author_id",
                            foreignField:"author_id",
                            as:"kahani_series"
                        }
                    },
                    {
                        $unwind:"$kahani_series"
                    }
                ],(err,data)=>{

                    for(let i=0;i<data.length;i++){

                        var story_Object_id = data[i].kahani_series._id;
                        var story_id_string = story_Object_id.toString();

                        stories.aggregate([
                            {
                                $lookup:{
                                    from:"story-views",
                                    localField:"story_id",
                                    foreignField:"story_id",
                                    as:'kahani_seriesviews'
                                }
                            },{
                                $unwind:'$kahani_seriesviews'
                            },
                            {
                                $match:{
                                    "created_at":{"$gte": start_date , "$lte":end_date}
                                }
                            },
                            {
                                $group:{_id:"$story_id",view_count:{$sum:1}}
                            },
                            {
                                $group:{
                                _id:null,
                                total:{
                                    $sum:"$view_count"
                                }
                                }
                            }
                        ],(err,story_daily_views)=>{
                            //console.log(story_daily_views);
                        })
                    }
                })


                //code for comments count --done
                stories.aggregate([
                    {
                        $match:{"author_id":user_id}
                    },
                    {
                        $lookup:{
                            from:"comments",
                            localField:"_id",
                            foreignField:"story_id",
                            as:"kahani_comment"
                        }
                    },
                    {
                        $unwind:"$kahani_comment"
                    },
                    {
                        $match:{
                            "created_at":{"$gte": start_date , "$lte":end_date}
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


                Follows.aggregate([
                    {
                        $match:{"target_id":user_id}
                    },
                    {
                        $match:{
                            "created_at":{"$gte": start_date , "$lte":end_date}
                        }
                    },
                    {
                        $group:{
                            _id:null,
                            followers_count:{$sum:1}
                        }
                    }
                ],(err,z1data)=>{
                    g_z1data =z1data;
                })

                transactions.aggregate([
                    //TODO: add transaction of type spent only.
                    {
                        $match:{"user_id":user_id,"transaction_type":"spent"}
                    },
                    {
                        $match:{
                            "created_at":{"$gte": start_date , "$lte":end_date}
                        }
                    },
                    {
                        $group:{
                            _id:user_id,
                            author_coins:{$sum:"$coins"}
                        }
                    }
                ],(err,coins_data_daily)=>{
                    if(coins_data_daily.length==0){
                        //console.log('No Transaction Found')
                    }else{
                        g_coins_data.push({
                            _id:coins_data_daily._id,
                            author_coins:coins_data_daily.author_coins
                        })
                        //console.log(ydata);
                    }
                })



                //email the author along with details
                //     const msg = {
                //     to: result[i].email,
                //     from: {
                //         email: 'pallav@kahaniya.com',
                //         name: 'Pallav Bajjuri'
                //     },
                //     cc:'telugu@kahaniya.com',
                //     dynamic_template_data: {
                //       full_name:xdata[i].data.full_name,
                //       email:xdata[i].data.email,
                //       stroy_views_count:xdata[i].Views_Count,
                //       story_written_count:xdata[i].story_count,
                //       followers_count:g_z1data.followers_count,
                //       Total_coins:g_y1data.author_coins,
                //       Comments_Count:g_z1data.comments_count
                //     },
                //     templateId:'d-979470da14304f689e298abbbbd2638a'
                //   };
            }
        })
})

app.listen(port);
console.log('server started...')