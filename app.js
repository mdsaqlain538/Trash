require('dotenv').config()

var express = require('express');
var app = express();
const bodyParser = require('body-parser');

var port = process.env.port || 1234;

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
const cron = require('node-cron');
const shell = require('shelljs');
 
//Middle ware..
app.use(bodyParser.urlencoded({
    extended: true
  }));

const stories = require('./models/stories');
const users = require('./models/users');
const Views = require('./models/storyViews');
const Transacation = require('./models/transactions');
const Kahanies = require('./models/kahanies');


app.use(morgan("dev"));
app.use(cookieParser());
app.use(session({
    secret:"saqlainpatel",
    saveUninitialized:true,
    resave:true
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
 // cron.schedule("0005 * * * * *",function(){
//     console.log('Nodejs Script Running');
// })



//Response the views assocaited with story written by author.

app.get('/author_views_story',(req,res)=>{
    stories.aggregate([
        {
            $group:{_id:"$author_id",count:{$sum:"$views_count"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
});


// Get the total views assocaited with story written by author.

app.get('/total_author_views_story',(req,res)=>{
    stories.aggregate([
        {
            $group:{
            _id:"$author_id",
            count_var:{$sum:"$views_count"}
            }
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$count_var"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
});

//Get the Views Response Associated with series written by author.

app.get('/author_views_series',(req,res)=>{
    Kahanies.aggregate([
        {
            $group:{_id:"$author_id",count:{$sum:"$views_count"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
});

//Get the Total Views Response Associated with series written by author.

app.get('/total_author_views_series',(req,res)=>{
    Kahanies.aggregate([
        {
            $group:{_id:"$author_id",count_var:{$sum:"$views_count"}}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$count_var"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})


// Response the views Assocaited with stories.

app.get('/story_views',(req,res)=>{
    Views.aggregate([
        {
            $group:{_id:"$story_id",count:{$sum:1}}
        }
    ],(err,data)=>{
        res.send(data);
    });
});

// Response the Total views Assocaited with stories.

app.get('/total_story_views',(req,res)=>{
    Views.aggregate([
        {
            $group:{_id:"$story_id",count_var:{$sum:1}}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$count_var"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
});

// Response the views Assocaited with Series.

app.get('/series_views',(req,res)=>{
    kahanies.aggregate([
        {
            $group:{_id:"$_id",count:{$sum:"$views_count"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})


// Response the Total views Assocaited with Series.

app.get('/total_series_views',(req,res)=>{
    kahanies.aggregate([
        {
            $group:{_id:"$_id",count_var:{$sum:"$views_count"}}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$count_var"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})



// Response the Coins Assocaited with story.

app.get('/story_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $or: [{transaction_type:"earn"},{transaction_type:"credit"}]}
        },
        {
            $group:{_id:"$story_id",Coins_count:{$sum:"$coins"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})

// Response the Total Coins Assocaited with story.

app.get('/total_story_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $or: [{transaction_type:"earn"},{transaction_type:"credit"}]}
        },
        {
            $group:{_id:"$story_id",Coins_count:{$sum:"$coins"}}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$Coins_count"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})


// Response the Coins Assocaited with Series.

app.get('/series_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $or: [{transaction_type:"earn"},{transaction_type:"credit"}]}
        },
        {
            $group:{_id:"$kahani_id",Coins_count:{$sum:"$coins"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})

// Response the Total Coins Assocaited with Series.

app.get('/total_series_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $or: [{transaction_type:"earn"},{transaction_type:"credit"}]}
        },
        {
            $group:{_id:"$kahani_id",Coins_count:{$sum:"$coins"}}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$Coins_count"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})


app.get('/author_wise_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $or: [{transaction_type:"earn"},{transaction_type:"credit"}]}
        },
        {
            $group:{_id:"$user_id",Coins_count:{$sum:"$coins"}}
        },
        {
            $lookup:{
                from:"stories",
                localField:"user_id",
                foreignField:"author_id",
                as:"saqlain"
            }
        }
    ],(err,data)=>{
        //res.send(data);
        res.send(data);
    })
})

// Get a Response of Views Generated with 24 hrs.

app.get('/views_by_day',(req,res)=>{
    console.log(new Date(Date.now() - 24*60*60));

    Views.aggregate([
        {
            $match:{"created_at":{"$gt": new Date(Date.now() - 24*60*60*1000)}}
        },
        {
            $group:{_id:"$story_id",count:{$sum:1}}
        },
        {
            $count: "TotalViews"
        }
    ],(err,data)=>{
        res.send(data);
    })
})



app.post('/language_wise_views',(req,res)=>{
    let lang = req.body.language;

    Kahanies.aggregate([
        {
            $match:{language:lang}
        },
        {
            $group:{_id:"$language",count:{$sum:"$views_count"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})

app.post('/language_wise_coins',(req,res)=>{
    let lang = req.body.language;
    console.log(lang);
    Kahanies.aggregate([
        {
            $match:{ language : lang }
        },
        {
            $lookup:{
                from:"transactions",
                localField:"author_id",
                foreignField:"user_id",
                as:"saqlain"
            }
        },
        {
            $unwind:"$saqlain"
        },
        {
            $match:{ $or: [{"saqlain.transaction_type":"earn"},{"saqlain.transaction_type":"credit"}]}
        },
        {
            $group:{_id:"$language",Coins_count:{$sum:"$saqlain.coins"}}
        }
],(err,data)=>{
    res.send(data);
})
});

app.post('/language',(req,res)=>{
    let lang =  (req.body.language);
    //console.log(lang);

    Kahanies.aggregate([
        {
            $match:{language:lang}
        }
    ],(err,data)=>{
        res.send(data);
    })
}) 

app.listen(port);
console.log('Server started..');