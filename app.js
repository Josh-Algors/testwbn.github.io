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

app.use(compression());

//Cross origin fix
app.use(cors());

// app.use(hbs());
//set views 
app.engine('hbs', hbs({extname: 'hbs', 
layoutsDir: __dirname + '/mailer/views/template/', 
defaultLayout: 'index'}));
app.set('views','./mailer/views/template/');
app.set('view engine', 'hbs');

//Parses requests body
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

//App Routes
app.use('/api/wbn/v1/auth/', AuthRoute);
app.use('/api/wbn/v1/', homeRoute);
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

const PORT = process.env.PORT || 3014;

app.listen(PORT, err => {
    if (err) {
        throw err;
    } else {
        console.log('Server running on port: '+PORT);
    }
});




