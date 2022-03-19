
const PORT = process.env.PORT || 5000;
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt-inzi");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require("path");
const SERVER_SECRET = process.env.SECRET || "1234"
const app = express();
const multer  = require('multer');


app.use(cookieParser());
app.use("/", express.static(path.resolve(path.join(__dirname, "public"))));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(
    cors({
        credentials: true,
        origin: ['https://iamfarooqi.github.io' , 'http://127.0.0.1:5501'],
        // methods: 'GET,HEAD,PUT,PATCH,DELETE' ,
    })
    );
    
    
    
let dbURI = "mongodb+srv://duetstudents:duetstudents@studentsdata.jr39q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



mongoose.connection.on('connected', function () {
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});

var userSchema = new mongoose.Schema({
    name: String,
    dept: String,
    batch: String,
    email: String,
    password: String,
    phone: String,
    createdOn: {
        type: Date,
        'default': Date.now
    }
});


const userModel = mongoose.model("users", userSchema);



// Upload file

app.use(bodyParser.urlencoded({extended: true}))
// app.use('/', uploadRouter);
// var router = express.Router();

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './docs/uploads/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now()+file.originalname)
//     }
//   })
 
//   const fileFilter=(req, file, cb)=>{
//    if(file.mimetype ==='image/jpeg' || file.mimetype ==='image/jpg' || file.mimetype ==='image/png'){
//        cb(null,true);
//    }else{
//        cb(null, false);
//    }
 
//   }
 
// var upload = multer({ 
//     storage:storage,
//     limits:{
//         fileSize: 1024 * 1024 * 5
//     },
//     fileFilter:fileFilter
//  });
 
// app.get('/',function(req,res){
//   res.sendFile(__dirname + './index.html');
 
// });
// app.post("/fileupload",upload.single('image'),function(req,res,next){
   
// const filename=req.file.filename;
//  res.json({
//             message:"Image Uploaded Successfully",
//             filename:filename
//         });
//     });
 

// app.use(function (req, res, next) {
//    //Enabling CORS
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
//      next();
//    });





//******* SIGNUP ********//


app.post("/signup", (req, res, next) => {

    if (!req.body.userName ||
        !req.body.userDept ||
        !req.body.userBatch ||
        !req.body.userEmail ||
        !req.body.userPassword ||
        !req.body.userPhone
    ) {

        res.status(403).send(`
            please send name, email, password, phone  in json body.
            e.g:
            {
                "name": "farooqi",
                "email": "farooqi@gmail.com",
                "password": "12345",
                "phone": "03332765421",
                
            }`)
        return;
    }

    userModel.findOne({ email: req.body.userEmail }, function (err, doc) {
        if (!err && !doc) {

            bcrypt.stringToHash(req.body.userPassword).then(function (hash) {

                var newUser = new userModel({
                    "name": req.body.userName,
                    "dept": req.body.userDept,
                    "batch": req.body.userBatch,
                    "email": req.body.userEmail,
                    "password": hash,
                    "phone": req.body.userPhone,
                })
                newUser.save((err, data) => {
                    if (!err) {
                        res.send({
                            message: "user created"
                        })
                    } else {
                        console.log(err);
                        res.status(500).send({
                            message: "user create error, " + err
                        })
                    }
                });
            })

        } else if (err) {
            res.status(500).send({
                message: "db error"
            })
        } else {
            res.send({
                message: "User already exist ",
                status: 409
            })
        }
    })

})




//LOGIN

app.post("/login", (req, res, next) => {
    console.log('body', req.body)
    if (!req.body.email || !req.body.password) {

        res.status(403).send(`
                please send email and password in json body.
                e.g:
                {
                    "email": "farooqi@gmail.com",
                    "password": "abc",
                }`)
        return;
    }
    userModel.findOne({
        email: req.body.email
    },
        function (err, user) {
            if (err) {
                res.status(500).send({
                    message: "an error occurred: " + JSON.stringify(err)
                });
            } else if (user) {
                bcrypt.varifyHash(req.body.password, user.password).then(isMatched => {
                    if (isMatched) {
                        console.log("matched");
                        var token =
                            jwt.sign({
                                id: user._id,
                                name: user.name,
                                email: user.email,
                            }, SERVER_SECRET);
                        res.cookie('jToken', token, {
                            maxAge: 86_400_000,
                            httpOnly: true
                        });
                        res.send({
                            message: "login success",
                            user: {
                                name: user.name,
                                email: user.email,
                                phone: user.phone,
                                gender: user.gender,
                            },
                            token: token
                        });

                    } else {
                        console.log("not matched");
                        res.status(401).send({
                            message: "incorrect password"
                        })
                    }
                }).catch(e => {
                    console.log("error: ", e)
                })

            } else {
                res.status(403).send({
                    message: "user not found"
                });
            }
        });

})

//Token

// 

app.get("/profile", (req, res, next) => {
    console.log('289', req.userId);
    userModel.findById(
        //   req.body.jToken.id,
        req.userId,
        "name dept batch phone ",
        function (err, data) {
            if (!err) {
                res.send({
                    userData: data,
                });
            } else {
                res.status(500).send({
                    message: "server error",
                });
            }
        }
    );
});


//LOGOUT
app.post("/logout", (req, res, next) => {
    console.log(req.cookies)
    res.cookie('jToken', "", {
        maxAge: 86_400_000,
        httpOnly: true
    });
    res.send("logout success");
})


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
//Server
app.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})