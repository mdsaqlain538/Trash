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


app.get('/users_by_day',(req,res)=>{
    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));

    
})


app.listen(port);
console.log('server started...')