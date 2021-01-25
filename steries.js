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




global.g_ydata = [];
global.g_zdata = [];



//complete report
//story_views & series
//story_count & series
try {
    // cron.schedule('*/10 * * * * *',(req,res)=>{
        var x =new Date();
        console.log(`Cron Job task Performed for Story & Series Total Author Views at ${x}`);
        //story_views based on telugu
        users.aggregate([
            {
                $project: {
                  user_id: {$toString: "$_id"},
                  "full_name":1,
                  "phone":1,
                  "email":1,
                  "followers_count":1,
                  "length": { $strLenCP: "$email" },
                  "Views_count":
                  {
                      $cond:{ if: { }, then: 30, else: 20 }
                  },
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
                $match:{"saqlain.type":"story","saqlain.language":"telugu","length":{"$gt": 0 }}
            },
            {
                $group:{
                    _id:"$user_id",
                    Views_Count:{$sum:"$saqlain.views_count"},
                    story_count:{$sum:1},
                    data : {$first : "$$ROOT"}
                    }
            }
            ],(err,xdata)=>{

                //code for author coins count
                for(let i=0;i<xdata.length;i++){
                    //var user_id = data[i]._id;
                    //5e53a7e59f81f00d34625260
                    var user_id = xdata[i].data.user_id;
                    //var user_id = '5e53a7e09f81f00d34624006';

                    //console.log(user_id);
                    transactions.aggregate([
                        //TODO: add transaction of type spent only.
                        {
                            $match:{"user_id":user_id,"transaction_type":"earn"}
                        },
                        // {
                        //     $match:{"created_at":{"$gt": new Date(Date.now() - 24*60*60*1000)}}
                        // },
                        {
                            $group:{
                                _id:user_id,
                                author_coins:{$sum:"$coins"},
                                //xdata:{$first:"$$ROOT"}
                            }
                        }
                    ],(err,ydata)=>{
                        if(ydata.length==0){
                            //console.log('No Transaction Found')
                            g_ydata.author_coins=0;
                        }else{
                            g_ydata = ydata;
                            console.log(ydata);
                        }
                    })


                //code for comments count
                    //var author_id = '5e53a7e09f81f00d34624006';

                    // kahaines 
                    //filter by author id
                    //type - story

                    stories.aggregate([
                        {
                            $match:{"author_id":user_id}
                        },
                        // {
                        //     $match:{"created_at":{"$gt": new Date(Date.now() - 24*60*60*1000)}}
                        // },
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
                                comments_count:{$sum:1},
                                //zdata:{$first:"$$ROOT"}
                            }
                        }
                    ],(err,zdata)=>{
                        if(zdata.length==0){
                            //console.log('No Comment Found')
                            g_zdata.comments_count=0;
                        }else{
                            g_zdata = zdata;
                            console.log(zdata);
                        }
                    })

                    //email the author along with details
                        const msg = {
                        to: xdata[i].data.email,
                        from: {
                            email: 'pallav@kahaniya.com',
                            name: 'Pallav Bajjuri'
                        },
                        cc:'telugu@kahaniya.com',
                        dynamic_template_data: {
                          full_name:xdata[i].data.full_name,
                          email:xdata[i].data.email,
                          stroy_views_count:xdata[i].Views_Count,
                          story_written_count:xdata[i].story_count,
                          followers_count:xdata[i].data.followers_count,
                          Total_coins:g_ydata.author_coins,
                          Comments_Count:g_zdata.comments_count
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
    // },{
    //     schedule:true,
    //     timezone:"Asia/Kolkata",
    //     })
} catch (error) {
    console.log(error);
}


try{
    //code updation
    

}catch(error){
    console.log(error);
}