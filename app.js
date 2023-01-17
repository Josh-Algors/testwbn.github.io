#!/usr/bin/env nodejs
//Load Environment Variables
require('dotenv').config();
const express = require('express');
const app = express();
const helpers = require('./config/helpers');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
// const sharp = require('sharp');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const helmet = require('helmet');
const compression = require('compression');
const bodyparser = require('body-parser');
const fileupload = require('express-fileupload');
const hbs = require('express-handlebars');



//Connect to DataBase
require('./database/db');

// const xss = require('xss');
// const rate = require('express-rate-limit');
// const multer = require('multer');
// const httpErrors = require('http-errors');
// const socket = require('socket.io');

// set security HTTP headers
app.use(helmet());

//sanitize request data
//app.use(xss());

//gzip compression
app.use(compression());

//Cross origin fix
app.use(cors());

//fileuploads
app.use(fileupload({
    useTempFiles : true
}));

// app.use(hbs());
//set views 
app.engine('hbs', hbs({extname: 'hbs', 
layoutsDir: __dirname + '/mailer/views/template/', 
defaultLayout: 'index'}));
app.set('views','./mailer/views/template/');
app.set('view engine', 'hbs');

// create a write stream (in append mode) // Logger
//var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
// setup the logger
//app.use(morgan('combined', { stream: accessLogStream }));

//Parses requests body
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Loads the handlebars module
// const handlebars = require('express-handlebars');

// //Sets our app to use the handlebars engine
// app.set('view engine', 'handlebars');

// //Sets handlebars configurations (we will go through them later on)
// app.engine('handlebars', handlebars({   
//     layoutsDir: __dirname + '/views/layouts',
// }));

// //Serves static files (we need it to import a css file)
// app.set(express.static(__dirname + '/public'));
// app.use("/css", express.static(__dirname + "/public/css"));

// app.use(function(req, res, next) {
//     res.setHeader("Content-Security-Policy", "script-src 'self' https://apis.google.com");
//     return next();
// });

// const Queue = require('bull')
// const { createBullBoard } = require('bull-board')
// const { BullAdapter } = require('bull-board/bullAdapter')
// const transferQueue = new Queue('transfer-queue')

// const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([
//   new BullAdapter(transferQueue),
// ]);

//card-queue
//app.use('/admin/queues', router);

app.disable('etag');

//Initialise Passport
app.use(passport.initialize());

//Cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if(req.method == "OPTIONS")
    {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE, PATCH, GET');
        return res.status(200).json({});
    }

    next();
})

//include route module
const AuthRoute = require('./routes/auth');
const homeRoute = require('./routes/public');
// const otherRoute = require('./routes/others');
// const kycRoute = require('./routes/kyc');
// const investmentRoute = require('./routes/investments');

//App Routes
app.use('/api/eac/v1/auth/', AuthRoute);
app.use('/api/eac/v1/', homeRoute);
//Landing Page
app.use('/test-page', function(req, res, next){
    res.send("if you are here, there you are lucky!!!");
});

app.use((req, res, next) => {
    const error = new Error("Route for resource is not found");
    error.status = 404;
    next(error);
});

//Error handling
app.use( (error, req, res, next) => {
    return res.status(error.status || 500).send({
        error: {
            status: 'ERROR',
            message: error.message || 'Internal Server Error'
        }
    })
});

// symplus.GenerateSymplusKey();

// //Update Symplus Key
// setInterval( async () => { 
//     symplus.GenerateSymplusKey()
// }, 100000); 

const PORT = process.env.PORT || 3014;

app.listen(PORT, err => {
    if (err) {
        throw err;
    } else {
        console.log('Server running on port: '+PORT);
    }
});




