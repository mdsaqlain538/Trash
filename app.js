require('dotenv').config()

var express = require('express');
var app = express();
const bodyParser = require('body-parser');

var port = process.env.port || 1234;

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
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
const saqlain = require('./models/saqlain');
const comments = require('./models/comments');


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

//sample cron job implementation
const cron = require('node-cron');

//email and sms integrate.
try {
    cron.schedule((req,res)=>{
        var x =new Date();
        console.log(`Cron Job task Performed for Story & Series Total Author Views at ${x}`);
        users.aggregate([
            {
                $project:{
                    "user_id":{"$toString":"$_id"},
                    "email":1,
                    "phone":1,
                    "full_name":1,
                    "length": { $strLenCP: "$email" }
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
                $match:{"saqlain.type":"story","length":{"$eq": 0 }}
            },
            {
                $group:{_id:"$phone",Views_Count:{$sum:"$saqlain.views_count"}}
            }
        ],(err,data)=>{
                    global.user_numbers=[];
                    global.country_code = 91;
                    console.log(data);

                    // for(let i=0;i<data.length;i++){
                    //     global.phone_number = parseInt(""+country_code+data[i]._id);
                    //     //console.log(phone_number);
                    //     global.check_number =phone_number;
                    //     if(check_number!=null){
                    //         //console.log(phone_number.toString().length);
                    //         if(check_number.toString().length==12){
                    //             user_numbers.push(
                    //                 phone_number
                    //             )
                    //         }
                    // }
                    // }
                    //MSG91 Code  
                    // msg91.send("XXXXXXXXXX", "Welcome to Kahaniya Group. MSG91 Implemented by Node.js_INTERN", function(err, response){
                    //     if(err){
                    //     console.log(err);
                    //     }else{
                    //     console.log(response);
                    //     }
                    // });
        })
        //email part
        setTimeout(function(){
            users.aggregate([
                {
                    $project: {
                      "email": 1,
                      "length": { $strLenCP: "$email" }
                    }
                  },
                  {
                    $match:{
                        "length":{"$gt": 0 }
                    }
                  }
            ],(err,data)=>{
                //send the mails to all users in these block of code.
                global.user_emails = [];
                for(let i=0;i<data.length;i++){
                    user_emails.push(data[i].email);
                }
        
        
                console.log(user_emails);
                //SendGrid Code.
                // setTimeout(function(){
        
                //     const msg = {
                //         to: user_emails,
                //         from: {
                //             email: 'pallav@kahaniya.com',
                //             name: 'Pallav Bajjuri'
                //         },
                //         cc:'admin@kahaniya.com',
                //         dynamic_template_data: {
                //           email: email
                //         },
                //         templateId:'d-979470da14304f689e298abbbbd2638a'
                //       };
        
                //     //ES6 mail functionality.
                //   sgMail
                //     .sendMultiple(msg)
                //     .then(() => {}, error => {
                //       console.error(error);
        
                //       if (error.response) {
                //         console.error(error.response.body)
                //       }
                //     });
                //   },5000);
            })
        },10000); 
    },{
        schedule:true,
        timezone:"Asia/Kolkata",
        })
} catch (error) {
    console.log(error);
}


//lets build the main requirment.
//get all the necessary data associated with the author
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
                  "length": { $strLenCP: "$email" }
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
                            $match:{"user_id":user_id}
                        },
                        {
                            $group:{
                                _id:user_id,
                                author_coins:{$sum:"$coins"},
                                xdata:{$first:"$$ROOT"}
                            }
                        }
                    ],(err,ydata)=>{
                        if(ydata.length==0){
                            //console.log('No Transaction Found')
                            ydata[i].author_coins=0;
                        }else{
                            console.log(ydata);
                        }
                    })


                //code for comments count
                    //var author_id = '5e53a7e09f81f00d34624006';

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
                                comments_count:{$sum:1},
                                zdata:{$first:"$$ROOT"}
                            }
                        }
                    ],(err,zdata)=>{
                        if(zdata.length==0){
                            //console.log('No Comment Found')
                            zdata[i].comments_count=0;
                        }else{
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
                          Total_coins:ydata[i].author_coins,
                          Comments_Count:zdata[i].comments_count
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






// Below Codes are functionalities associated for Cron Job Usage.


// Users by Daily - $match:{"created_at":{"$gt": new Date(Date.now() - 24*60*60*1000)}}
// Users by Weekly - 


//done
app.post('/total_users',(req,res)=>{
    var start_date = req.body.start;
    var end_date = req.body.end;
    
    if(start_date==end_date){
        start_date = start_date + " 00:00:00.000Z";
        end_date = end_date + " 23:59:00.000Z";
        converted_start_date=new Date(Date.parse(start_date));
        converted_end_date = new Date(Date.parse(end_date));
        users.aggregate([
            {
                $match:{
                    "created_at":{"$gte": converted_start_date , "$lte":converted_end_date}
                }
            },
            {
                $count:"Total Users"
            }
        ],(err,data)=>{
            res.send(data);
        })
    }else{
        start_date = start_date + " 00:00:00.000Z";
        end_date = end_date + " 00:00:00.000Z";
        converted_start_date=new Date(Date.parse(start_date));
        converted_end_date = new Date(Date.parse(end_date));
        users.aggregate([
            {
                $match:{
                    "created_at":{"$gte": converted_start_date , "$lte":converted_end_date}
                }
            },
            {
                $count:"Total Users"
            }
        ],(err,data)=>{
            res.send(data);
        })
    }   
})


//done
app.post('/users_montly',(req,res)=>{
    var date = req.body.date;
    var year = date[0]+date[1]+date[2]+date[3];

    var months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    //console.log(year);
    start_year = year;
    // end_year = year+1;

    var result = [];

    converted_start_date = start_year+'-01'+'-01';
    converted_end_date = start_year+'-01'+'31';
    
    for(let i=1;i<=12;i++){
        if(i<=10){
            converted_start_date = start_year+'-0'+i+'-01';
            converted_end_date = start_year+'-0'+i+'-31';
            converted_start_date=new Date(Date.parse(converted_start_date));
            converted_end_date=new Date(Date.parse(converted_end_date));
        }

        else{

            converted_start_date = start_year+i+'-01';
            converted_end_date = start_year+i+'-31';
            converted_start_date=new Date(Date.parse(converted_start_date));
            converted_end_date=new Date(Date.parse(converted_end_date));
        }

            users.aggregate([
                {
                    $match:{
                        "created_at":{"$gte": converted_start_date , "$lte":converted_end_date}
                    }
                },
                {
                    $count:"Users"
                }
            ],(err,data)=>{
                if(data.length==1){
                    result.push({
                        month: months[i-1],
                        Users: data[0].Users
                    });
                }else{
                    result.push({
                        month: months[i-1],
                        Users: 0
                    });
                }
                if(i==12){
                    res.send(result);
                }
            })
    }
})


//Response the views assocaited with series written by author.
//done

app.get('/author_views_story',(req,res)=>{
    users.aggregate([
        {
            $project:{
                "user_id":{"$toString":"$_id"},
                "email":1,
                "phone":1,
                "full_name":1,
                "length": { $strLenCP: "$email" }
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
            $match:{"saqlain.type":"story","length":{"$eq": 0 }}
        },
        {
            $group:{_id:"$phone",Views_Count:{$sum:"$saqlain.views_count"}}
        }
    ],(err,data)=>{
        console.log(data);
    })
});


// Get the total views assocaited with story written by author.
//done

app.get('/total_author_views_story',(req,res)=>{
    users.aggregate([
        {
            $project:{"user_id":{"$toString":"$_id"},"name":{"$toString":"$full_name"}}
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
            $match:{"saqlain.type":"story"}
        },
        {
            $group:{_id:"$name",Views_Count:{$sum:"$saqlain.views_count"}}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$Views_Count"
            }
            }
        }
    ],(err,data)=>{
        console.log(data);
    })
});

//Get the Views Response Associated with series written by author.
//done
app.get('/author_views_series',(req,res)=>{
    users.aggregate([
        {
            $project:{"user_id":{"$toString":"$_id"},"name":{"$toString":"$full_name"}}
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
            $match:{"saqlain.type":"series"}
        },
        {
            $group:{_id:"$name",Views_Count:{$sum:"$saqlain.views_count"}}
        }
    ],(err,data)=>{
        console.log(data);
    })
});

//Get the Total Views Response Associated with series written by author.
//done
app.get('/total_author_views_series',(req,res)=>{
    users.aggregate([
        {
            $project:{"user_id":{"$toString":"$_id"},"name":{"$toString":"$full_name"}}
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
            $match:{"saqlain.type":"series"}
        },
        {
            $group:{_id:"$name",Views_Count:{$sum:"$saqlain.views_count"}}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$Views_Count"
            }
            }
        }
    ],(err,data)=>{
        console.log(data);
    })
})


// Response the views Assocaited with stories.
//done

app.get('/story_views',(req,res)=>{
    kahanies.aggregate([
        {
            $match:{type:"story"}
        },
        {
            $group:{_id:"$_id",Views_Count:{$sum:"$views_count"}}
        }  
    ],(err,data)=>{
        res.send(data);
    })
});

// Response the Total views Assocaited with stories.
//done

app.get('/total_story_views',(req,res)=>{
    Kahanies.aggregate([
        // {
        //     // $group:{_id:"$story_id",count_var:{$sum:1}}
        // },
        {
            $match:{type:"story"}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$views_count"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
});

// Response the views Assocaited with Series.
//done

app.get('/series_views',(req,res)=>{
    kahanies.aggregate([
        {
            $match:{type:"series"}
        },
        {
            $group:{_id:"$_id",Views_Count:{$sum:"$views_count"}}
        }  
    ],(err,data)=>{
        res.send(data);
    })
})


// Response the Total views Assocaited with Series.
//done

app.get('/total_series_views',(req,res)=>{
    Kahanies.aggregate([
        // {
        //     // $group:{_id:"$story_id",count_var:{$sum:1}}
        // },
        {
            $match:{type:"series"}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$views_count"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})



// Response the Coins Assocaited with story.
//done

app.get('/story_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $and: [{transaction_type:"earn"},{product_type:"story"}]}
        },
        {
            $group:{_id:"$story_id",Coins_count:{$sum:"$coins"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})

// Response the Total Coins Assocaited with story.
//done

app.get('/total_story_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $and: [{transaction_type:"earn"},{product_type:"story"}]}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$coins"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})


// Response the Coins Assocaited with Series.
//done
app.get('/series_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $and: [{transaction_type:"earn"},{product_type:"series"}]}
        },
        {
            $group:{_id:"$story_id",Coins_count:{$sum:"$coins"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})

// Response the Total Coins Assocaited with Series.
//done
app.get('/total_series_coins',(req,res)=>{
    Transacation.aggregate([
        {
            $match:{ $and: [{transaction_type:"earn"},{product_type:"series"}]}
        },
        {
            $group:{
            _id:null,
            total:{
                $sum:"$coins"
            }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})

//done
app.get('/author_wise_coins',(req,res)=>{
    var date = new Date();
    console.log(date);
    stories.aggregate([
        //my new code
        {
            $match:{"created_at":{"$gt": new Date(Date.now() - 24*60*60*1000)}}
        },
        // {
        //     $match:{
        //         "created_at":{"$lte":date}
        //     }
        // },
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
            $match:{ $or: [{"saqlain.transaction_type":"earn"}]}
        },
        {
            $group:{_id:"$author_id",Coins_count:{$sum:"$saqlain.coins"}}
        }
    ],(err,data)=>{
        //res.send(data);
        res.send(data);
    })
})

// Get a Response of Views Generated with 24 hrs.
//done
app.post('/views_by_start_and_end',(req,res)=>{
    var start_date = req.body.start;
    var end_date = req.body.end;
    start_date = start_date + " 00:00:00.000Z";
    end_date = end_date + " 00:00:00.000Z";
    converted_start_date=new Date(Date.parse(start_date));
    converted_end_date = new Date(Date.parse(end_date));
    Views.aggregate([
        {
            $match:{
                "created_at":{"$gt": converted_start_date , "$lt":converted_end_date}
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
    ],(err,data)=>{
        res.send(data);
    })
})

//done
app.post('/language_wise_views',(req,res)=>{
    var lang = req.body.language;
    kahanies.aggregate([
        {
            $match:{language:"telugu"}
        },
        {
            $group:{
                _id:null,
                total:{
                    $sum:"$views_count"
                }
            }
        }
    ],(err,data)=>{
        res.send(data);
    })
})


//done
app.post('/language_wise_coins',(req,res)=>{
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
            $group:{_id:"$language",Coins_count:{$sum:"$saqlain.coins"}}
        }
],(err,data)=>{
    res.send(data);
})
});



//done
app.get('/genre_views',(req,res)=>{
    Kahanies.aggregate([
        {
            $group:{_id:"$genre",count:{$sum:"$views_count"}}
        }
    ],(err,data)=>{
        res.send(data);
    })
})


//sample
app.get('/email_sms_data',(req,res)=>{
    global.user_numbers=[];
    global.country_code = 91;
    users.find({email:""},(err,data)=>{
        //console.log(data);
        for(let i=0;i<data.length;i++){
            global.phone_number = parseInt(""+country_code+data[i].phone);
            //console.log(phone_number);
            global.check_number =phone_number;
            if(check_number!=null){
                //console.log(phone_number.toString().length);
                if(check_number.toString().length==12){
                    user_numbers.push(
                        phone_number
                    )
                }
        }
        }

        //MSG91 Code  
        msg91.send("XXXXXXXXXX", "Welcome to Kahaniya Group. MSG91 Implemented by Node.js_INTERN", function(err, response){
            if(err){
              console.log(err);
            }else{
            console.log(response);
            }
          });
    });

    users.aggregate([
        {
            $project: {
              "email": 1,
              "length": { $strLenCP: "$email" }
            }
          },
          {
            $match:{
                "length":{"$gt": 0 }
            }
          }
    ],(err,data)=>{
        //send the mails to all users in these block of code.
        global.user_emails = [];
        for(let i=0;i<data.length;i++){
            user_emails.push(users[i].email);
        }


        //SendGrid Code.
        setTimeout(function(){

            const msg = {
                to: user_emails,
                from: {
                    email: 'pallav@kahaniya.com',
                    name: 'Pallav Bajjuri'
                },
                cc:'admin@kahaniya.com',
                dynamic_template_data: {
                  email: email
                },
                templateId:'d-979470da14304f689e298abbbbd2638a'
              };

            //ES6 mail functionality.
          sgMail
            .sendMultiple(msg)
            .then(() => {}, error => {
              console.error(error);

              if (error.response) {
                console.error(error.response.body)
              }
            });
          },5000);
    })

    

    
    // setTimeout(function(){
    //     console.log(user_numbers);
    // },10000);
})

app.listen(port);
console.log('Server started..');