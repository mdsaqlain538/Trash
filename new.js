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


// data crunching for coins only
//1. coins by story daily basis.
app.get('/story_coins_daily',(req,res)=>{
    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));

    kahanies.aggregate([
        {
            $project:{
                "story_id":{"$toString":"$_id"},
                "type":1,
                "author_id":1,
                "language":1,
                "genre":1
                }
        },
        {
                    $lookup:{
                        from:"transactions",
                        localField:"story_id",
                        foreignField:"story_id",
                        as:"saqlain"
                    }
        },
        {
            $unwind:"$saqlain"
        },
        {
            $match:{"product_type":"story","transaction_type":"spent"}
        },
        {
            $match:{
                "created_at":{"$gte": start_date , "$lte":end_date}
            }
        },
        {
            $group:{_id:"$story_id",coins_count:{$sum:"$saqlain.coins"}}
        }
    ],(err,data)=>{
        console.log(data);
    })
})


//2. coins by author daily basis
app.get('/author_coins_daily',(req,res)=>{
    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));

    kahanies.aggregate([
        {
            $project:{
                "story_id":{"$toString":"$_id"},
                "type":1,
                "author_id":1,
                "language":1,
                "genre":1
                }
        },
        {
                    $lookup:{
                        from:"transactions",
                        localField:"story_id",
                        foreignField:"story_id",
                        as:"saqlain"
                    }
        },
        {
            $unwind:"$saqlain"
        },
        {
            $match:{"product_type":"story","transaction_type":"earn"}
        },
        {
            $match:{
                "created_at":{"$gte": start_date , "$lte":end_date}
            }
        },
        {
            $group:{_id:"$author_id",coins_count:{$sum:"$saqlain.coins"}}
        }
    ],(err,data)=>{
        console.log(data);
    })
})



//3. Series wise Coins daily basis.
app.get('/series_coins_daily',(req,res)=>{
    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));

    kahanies.aggregate([
        {
            $project:{
                "story_id":{"$toString":"$_id"},
                "type":1,
                "author_id":1,
                "language":1,
                "genre":1
                }
        },
        {
                    $lookup:{
                        from:"transactions",
                        localField:"story_id",
                        foreignField:"story_id",
                        as:"saqlain"
                    }
        },
        {
            $unwind:"$saqlain"
        },
        {
            $match:{"saqlain.product_type":{$in:['story','series']},"saqlain.transaction_type":"spent"}
        },
        {
            $match:{
                "created_at":{"$gte": start_date , "$lte":end_date}
            }
        },
        {
            $group:{_id:"$story_id",coins_count:{$sum:"$saqlain.coins"}}
        }
    ],(err,data)=>{
        console.log(data);
    })
})


//4. Language wise coins 
//done
app.post('/language_wise_coins',(req,res)=>{
    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));


    let lang = req.body.language;
    Kahanies.aggregate([
        {
            $match:{
                $and: [{language:lang}]
                }
        },
        {
            $project:{
                "saqlain_id":{"$toString":"$_id"},
                "language":{"$toString":"$language"}
            }
        },
        {
            $lookup:{
                from:"transactions",
                localField:"saqlain_id",
                foreignField:"kahani_id",
                as:"saqlain"
            }
        },
        {
            $unwind:"$saqlain"
        },
        {
            $match:{ $or: [{"saqlain.transaction_type":"earn"}]}
        },
        {
            $match:{
                "created_at":{"$gte": start_date , "$lte":end_date}
            }
        },
        {
            $group:{_id:"$language",Coins_count:{$sum:"$saqlain.coins"}}
        }
],(err,data)=>{
    res.send(data);
})
});


//5.genre coins by daily basis
app.get('/genre_views',(req,res)=>{
    Kahanies.aggregate([
        {
            $group:{_id:"$genre",count:{$sum:"$views_count"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})


//done
app.post('/genre_wise_coins',(req,res)=>{
    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));


    let genre = req.body.genre;
    Kahanies.aggregate([
        {
            $match:{
                $and: [{genre:genre}]
                }
        },
        {
            $project:{
                "saqlain_id":{"$toString":"$_id"},
                "genre":{"$toString":"$genre"}
            }
        },
        {
            $lookup:{
                from:"transactions",
                localField:"saqlain_id",
                foreignField:"kahani_id",
                as:"saqlain"
            }
        },
        {
            $unwind:"$saqlain"
        },
        {
            $match:{ $or: [{"saqlain.transaction_type":"earn"}]}
        },
        {
            $match:{
                "created_at":{"$gte": start_date , "$lte":end_date}
            }
        },
        {
            $group:{_id:"$genre",Coins_count:{$sum:"$saqlain.coins"}}
        }
],(err,data)=>{
    res.send(data);
})
});



//Views Part
//1. Views by story daily basis.
app.get('/story_view_daily',(req,res)=>{


    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));



    kahanies.aggregate([
        {
            $project: {
              kahani_id: {$toString: "$_id"},
              type:1,
              language:1,
              genre:1
            }
        },
        {
        $match:{type:"story"}
        },
        {
        $lookup:{
            from:"stories",
            localField:"kahani_id",
            foreignField:"kahani_id",
            as:"saqlain"
        }
        },
        {
        $unwind:"$saqlain"
        }
    ],(err,data)=>{
        for(let i=0;i<data.length;i++){
            var id = data[i].saqlain._id;
            const myMongoDbObjId = ObjectId(id);
            const story_id = myMongoDbObjId.toString();
            Views.aggregate([
                {
                    $match:{"story_id":story_id}
                },
                {
                    $match:{
                        "created_at":{"$gte": start_date , "$lte":end_date}
                    }
                },
                {
                    $group:{
                        _id:"$story_id",
                        total:{
                                $sum:1
                            }
                    }
                }
            ],(err,data1)=>{
                console.log(data1);
            })
        }
    })
})

//1. author views by  daily basis.
app.get('/author_view_daily',(req,res)=>{


    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));



    kahanies.aggregate([
        {
            $project: {
              kahani_id: {$toString: "$_id"},
              author_id:1,
              type:1,
              language:1,
              genre:1
            }
        },
        {
        $lookup:{
            from:"stories",
            localField:"kahani_id",
            foreignField:"kahani_id",
            as:"saqlain"
        }
        },
        {
        $unwind:"$saqlain"
        }
    ],(err,data)=>{
        for(let i=0;i<data.length;i++){
            var id = data[i].saqlain._id;
            const myMongoDbObjId = ObjectId(id);
            const story_id = myMongoDbObjId.toString();
            Views.aggregate([
                {
                    $match:{"story_id":story_id}
                },
                {
                    $match:{
                        "created_at":{"$gte": start_date , "$lte":end_date}
                    }
                },
                {
                    $group:{
                        _id:"$author_id",
                        total:{
                                $sum:1
                            }
                    }
                }
            ],(err,data1)=>{
                console.log(data1);
            })
        }
    })
})


//1. Views by Series daily basis.
app.get('/series_view_daily',(req,res)=>{


    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));



    kahanies.aggregate([
        {
            $project: {
              kahani_id: {$toString: "$_id"},
              type:1,
              language:1,
              genre:1
            }
        },
        {
        $match:{type:"series"}
        },
        {
        $lookup:{
            from:"stories",
            localField:"kahani_id",
            foreignField:"kahani_id",
            as:"saqlain"
        }
        },
        {
        $unwind:"$saqlain"
        }
    ],(err,data)=>{
        for(let i=0;i<data.length;i++){
            var id = data[i].saqlain._id;
            const myMongoDbObjId = ObjectId(id);
            const story_id = myMongoDbObjId.toString();
            Views.aggregate([
                {
                    $match:{"story_id":story_id}
                },
                {
                    $match:{
                        "created_at":{"$gte": start_date , "$lte":end_date}
                    }
                },
                {
                    $group:{
                        _id:"$story_id",
                        total:{
                                $sum:1
                            }
                    }
                }
            ],(err,data1)=>{
                console.log(data1);
            })
        }
    })
})

//1. language by story daily basis.
app.get('/language_view_daily',(req,res)=>{


    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));



    kahanies.aggregate([
        {
            $project: {
              kahani_id: {$toString: "$_id"},
              type:1,
              language:1,
              genre:1
            }
        },
        {
        $match:{type:"story"}
        },
        {
        $lookup:{
            from:"stories",
            localField:"kahani_id",
            foreignField:"kahani_id",
            as:"saqlain"
        }
        },
        {
        $unwind:"$saqlain"
        }
    ],(err,data)=>{
        for(let i=0;i<data.length;i++){
            var id = data[i].saqlain._id;
            const myMongoDbObjId = ObjectId(id);
            const story_id = myMongoDbObjId.toString();
            Views.aggregate([
                {
                    $match:{"story_id":story_id}
                },
                {
                    $match:{
                        "created_at":{"$gte": start_date , "$lte":end_date}
                    }
                },
                {
                    $group:{
                        _id:"$language",
                        total:{
                                $sum:1
                            }
                    }
                }
            ],(err,data1)=>{
                console.log(data1);
            })
        }
    })
})

//1. Views by genre daily basis.
app.get('/genre_view_daily',(req,res)=>{


    var today = new Date()
    var yesterday = new Date(today)


    yesterday.setDate(yesterday.getDate() - 1);
    today = today.setHours(23,59,59);
    yesterday = yesterday.setHours(0,0,0);
    start_date = (new Date(yesterday));
    end_date = (new Date(today));



    kahanies.aggregate([
        {
            $project: {
              kahani_id: {$toString: "$_id"},
              type:1,
              language:1,
              genre:1
            }
        },
        {
        $match:{type:"story"}
        },
        {
        $lookup:{
            from:"stories",
            localField:"kahani_id",
            foreignField:"kahani_id",
            as:"saqlain"
        }
        },
        {
        $unwind:"$saqlain"
        }
    ],(err,data)=>{
        for(let i=0;i<data.length;i++){
            var id = data[i].saqlain._id;
            const myMongoDbObjId = ObjectId(id);
            const story_id = myMongoDbObjId.toString();
            Views.aggregate([
                {
                    $match:{"story_id":story_id}
                },
                {
                    $match:{
                        "created_at":{"$gte": start_date , "$lte":end_date}
                    }
                },
                {
                    $group:{
                        _id:"$genre",
                        total:{
                                $sum:1
                            }
                    }
                }
            ],(err,data1)=>{
                console.log(data1);
            })
        }
    })
})



app.listen(port);
console.log('Server started..');