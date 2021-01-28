require('dotenv').config()

var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var morgan = require('morgan');
const axios = require('axios');

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

// Notification to users and kahaniya.
app.get('/new_coin',(req,res)=>{

  //msg to be send as an notification.
  const msg = {
    to: 'accounts@kahaniya.com',
    from: {
        email: 'pallav@kahaniya.com',
        name: 'Pallav Bajjuri'
    },
    cc:'telugu@kahaniya.com',
    dynamic_template_data: {
      user_name:'saqlain538',
      number_coins:78,
      balance:21
    },
    templateId:'d-979470da14304f689e298abbbbd2638a'
  };


  //ES6 mail functionality.
  //TODO:msg parameter has been removed to avoid unexpected mailing.
  sgMail
      .sendMultiple()
      .then(() => {}, error => {
      console.error(error);

      if (error.response) {
          console.error(error.response.body)
      }
      });

})


app.get('/new_checkout',(req,res)=>{

  //msg to be send as an notification.
  const msg = {
    to: 'accounts@kahaniya.com',
    from: {
        email: 'pallav@kahaniya.com',
        name: 'Pallav Bajjuri'
    },
    cc:'telugu@kahaniya.com',
    dynamic_template_data: {
      full_name:'saqlain patel',
      email:'mdsaqlain@gmail.com',
      number_coins:48,
      balance:12
    },
    templateId:'d-979470da14304f689e298abbbbd2638a'
  };


  //ES6 mail functionality.
  //TODO:msg parameter has been removed to avoid unexpected mailing.
  sgMail
      .sendMultiple()
      .then(() => {}, error => {
      console.error(error);

      if (error.response) {
          console.error(error.response.body)
      }
      });

})


app.get('/new_comment',(req,res)=>{

  //msg to be send as an notification.
  const msg = {
    to: 'author_email@gmail.com',
    from: {
        email: 'pallav@kahaniya.com',
        name: 'Pallav Bajjuri'
    },
    cc:'telugu@kahaniya.com',
    dynamic_template_data: {
      full_name:'saqlain patel',
      author_name:'deepak',
      comment_content:'thanks for uploading story.'
    },
    templateId:'d-979470da14304f689e298abbbbd2638a'
  };


  //ES6 mail functionality.
  //TODO:msg parameter has been removed to avoid unexpected mailing.
  sgMail
      .sendMultiple()
      .then(() => {}, error => {
      console.error(error);

      if (error.response) {
          console.error(error.response.body)
      }
      });

})

app.get('/new_review',(req,res)=>{

  //msg to be send as an notification.
  const msg = {
    to: 'author_email@kahaniya.com',
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
  sgMail
      .sendMultiple()
      .then(() => {}, error => {
      console.error(error);

      if (error.response) {
          console.error(error.response.body)
      }
      });

})



app.get('/new_episode',(req,res)=>{

  //msg to be send as an notification.
  const msg = {
    to: 'all_users_email@gmail.com',
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
  sgMail
      .sendMultiple()
      .then(() => {}, error => {
      console.error(error);

      if (error.response) {
          console.error(error.response.body)
      }
      });

})



// try{

// var today = new Date();
// //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
// //console.log(time);
//   comments.aggregate([
//     {
//       $match:{"created_at":today}
//     },
//     {
//       $lookup:{
//       from:'stories',
//       let:{resultObj:{$toObjectId:'$story_id'}},
//       pipeline:
//       [{
//           $match:{
//               $expr:{$eq:['$_id','$$resultObj']}
//           }
//       }],
//       as:'saqlain'
//    }
//  },
//  {
//    $unwind:"$saqlain"
//  }
//   ],(err,data)=>{
//     for(let i=0;i<data.length;i++){


//       //author-details
//       var myMongoDbObjId = data[i].saqlain.author_id;
//       var user_id = data[i].user_id;
//       const author_id = ObjectId(myMongoDbObjId);

//       users.aggregate([
//         {
//           $match:{"_id":author_id}
//         },
//         {
//           $project:{
//             "full_name":1,
//             "phone":1,
//             "email":1
//           }
//         }
//       ],(err,auth)=>{
//         console.log(auth);
//       })


//       //user-details
//       users.aggregate([
//         {
//           $match:{"_id":user_id}
//         },
//         {
//           $project:{
//             "full_name":1,
//             "phone":1,
//             "email":1
//           }
//         }
//       ],(err,user)=>{
//         console.log(user);
//       })

//     }    
//   })
// }catch(error){
//   console.log(error);
// }


app.listen(port);
console.log('Server started..');