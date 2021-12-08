const PORT = process.env.PORT || 5000;

var express = require("express");
var bodyParser = require('body-parser');
var cors = require("cors");
var morgan = require("morgan");
const mongoose = require("mongoose");
var bcrypt = require("bcrypt-inzi");
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var postmark = require("postmark");
const path = require("path");
const axios = require('axios')

var client = new postmark.Client("03d41ca2-fd57-4edd-9e9e-506ac1aaf894");

var SERVER_SECRET = process.env.SECRET || "1234"

// var userModel = mongoose.model("users", userSchema);



// let dbURI = "mongodb+srv://iamfarooqi:03325312621@cluster0.8tr9b.mongodb.net/TestDataBase?retryWrites=true&w=majority";
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
var stdModel = mongoose.model("duet-students", userSchema);


var otpSchema = new mongoose.Schema({
    "email": String,
    "otpCode": String,
    "createdOn": { "type": Date, "default": Date.now },
});


var otpModel = mongoose.model("otps", otpSchema);

module.exports = {
    stdModel: stdModel,
    otpModel: otpModel
}

var app = express();

app.use(bodyParser.json());
app.use(cors(
    {
        origin: "*",
        credentials: true
    }
));
app.use(morgan('dev'));
app.use(cookieParser());

app.use("/", express.static(path.resolve(path.join(__dirname, "public"))));



//******* SIGNUP ********//


app.post("/signup", (req, res, next) => {

    if (!req.body.stdName ||
        !req.body.stdDept ||
        !req.body.stdBatch ||
        !req.body.stdEmail ||
        !req.body.stdPassword ||
        !req.body.stdPhone
    ) {

        res.status(403).send(`
            please send name, email, password, phone and gender in json body.
            e.g:
            {
                "name": "farooqi",
                "dept": "CSE"
                "Batch": "batch-19/F"
                "email": "iamfarooqi@gmail.com",
                "password": "12345",
                "phone": "03325321621",
                
            }`)
        return;
    }





    stdModel.findOne({ email: req.body.stdEmail },
        function (err, doc) {
            if (!err && !doc) {

                bcrypt.stringToHash(req.body.stdPassword).then(function (hash) {

                    var newUser = new stdModel({
                        "name": req.body.stdName,
                        "dept": req.body.stdDept,
                        "batch": req.body.stdBatch,
                        "email": req.body.stdEmail,
                        "password": hash,
                        "phone": req.body.stdPhone,
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

    if (!req.body.email || !req.body.password) {

        res.status(403).send(`
                please send email and password in json body.
                e.g:
                {
                    "email": "iamfarooqi.com",
                    "password": "abc",
                }`)
        return;
    }

    stdModel.findOne({ email: req.body.email },
        function (err, std) {
            if (err) {
                res.status(500).send({
                    message: "an error occured: " + JSON.stringify(err)
                });
            } else if (std) {

                bcrypt.varifyHash(req.body.password, std.password).then(isMatched => {
                    if (isMatched) {
                        console.log("matched");

                        var token =
                            jwt.sign({
                                id: std._id,
                                name: std.name,
                                email: std.email,
                            }, SERVER_SECRET)

                        res.cookie('jToken', token, {
                            maxAge: 86_400_000,
                            httpOnly: true
                        });



                        res.send({
                            message: "login success",
                            user: {
                                name: std.name,
                                email: std.email,
                                phone: std.phone,
                                gender: std.gender,
                            }
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



//FORGOT PASSWORD



app.post("/forget-password", (req, res, next) => {

    if (!req.body.email) {

        res.status(403).send(`
            please send email in json body.
            e.g:
            {
                "email": "iamfarooqi@gmail.com"
            }`)
        return;
    }

    stdModel.findOne({ email: req.body.email },
        function (err, user) {
            if (err) {
                res.status(500).send({
                    message: "an error occured: " + JSON.stringify(err)
                });
            } else if (user) {
                const otp = Math.floor(getRandomArbitrary(11111, 99999))

                otpModel.create({
                    email: req.body.email,
                    otpCode: otp
                }).then((doc) => {

                    client.sendEmail({
                        "From": "ahmed_student@sysborg.com",
                        "To": req.body.email,
                        "Subject": "Reset your password",
                        "TextBody": `Here is your pasword reset code: ${otp}`
                    }).then((status) => {

                        console.log("status: ", status);
                        res.send({
                            message: "Email Send OPT",
                            status: 200
                        })

                    })

                }).catch((err) => {
                    console.log("error in creating otp: ", err);
                    res.status(500).send("unexpected error ")
                })


            } else {
                res.status(403).send({
                    message: "user not found"
                });
            }
        });
})

app.post("/forget-password-step-2", (req, res, next) => {

    if (!req.body.email && !req.body.otp && !req.body.newPassword) {

        res.status(403).send(`
            please send email & otp in json body.
            e.g:
            {
                "email": "iamfarooqi@gmail.com",
                "newPassword": "******",
                "otp": "#####" 
            }`)
        return;
    }

    stdModel.findOne({ email: req.body.email },
        function (err, user) {
            if (err) {
                res.status(500).send({
                    message: "an error occured: " + JSON.stringify(err)
                });
            } else if (user) {

                otpModel.find({ email: req.body.email },
                    function (err, otpData) {



                        if (err) {
                            res.status(500).send({
                                message: "an error occured: " + JSON.stringify(err)
                            });
                        } else if (otpData) {
                            otpData = otpData[otpData.length - 1]

                            console.log("otpData: ", otpData);

                            const now = new Date().getTime();
                            const otpIat = new Date(otpData.createdOn).getTime(); // 2021-01-06T13:08:33.657+0000
                            const diff = now - otpIat; // 300000 5 minute

                            console.log("diff: ", diff);

                            if (otpData.otpCode === req.body.otp && diff < 300000) { // correct otp code
                                otpData.remove()

                                bcrypt.stringToHash(req.body.newPassword).then(function (hash) {
                                    user.update({ password: hash }, {}, function (err, data) {
                                        res.send("password updated");
                                    })
                                })

                            } else {
                                res.status(401).send({
                                    message: "incorrect otp"
                                });
                            }
                        } else {
                            res.status(401).send({
                                message: "incorrect otp"
                            });
                        }
                    })

            } else {
                res.status(403).send({
                    message: "user not found"
                });
            }
        });
})




//LOGOUT



app.post("/logout", (req, res, next) => {
    res.cookie('jToken', "", {
        maxAge: 86_400_000,
        httpOnly: true
    });
    res.send("logout success");
})


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

//PROFILE

// app.get("/profile", (req, res, next) => {

//     console.log(req.body)

//     userModel.findById(req.body.jToken.id, 'name email phone gender createdOn',
//         function (err, doc) {
//             if (!err) {
//                 res.send({
//                     profile: doc
//                 })

//             } else {
//                 res.status(500).send({
//                     message: "server error"
//                 })
//             }
//         })
// })


//COOKIES

app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies);
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate; // 86400,000

            if (diff > 300000) { // expire after 5 min (in milis)
                res.status(401).send("token expired")
            } else { // issue new token
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})



//Server
app.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})
        // newUser.save((err, data) => {
        //     if (!err) {
        //         res.send("user created")
        //     } else {
        //         console.log(err);
        //         res.status(500).send("user create error, " + err)
        //     }
        // });