const express = require('express');
const router = express.Router();
const passport = require('passport')
require('../config/passport')
require('dotenv').config();

// import controller
var GetConfigCtrl =  require('../controllers/GetConfigCtrl');

//middleware
var jwtMiddleWare = passport.authenticate('jwt', {session: false});
const signatureSigner = require('../middleware/checkSignature').personalSignature;
// const imageGuard = require('../middleware/upload').imageFilter;
var dataGuard;

const redisCache = require('../middleware/configCache').redisCache;

if(process.env.APP != 'local')
{
    dataGuard = require('../middleware/decodeJWT').decodeMiddleware;
}
else
{
    dataGuard = (req, res, next) => {
        next()
    }
}

// Routes
//router.get('/:type',[jwtMiddleWare, signatureSigner, redisCache], GetConfigCtrl.GetData);
router.get('/:type',[signatureSigner], GetConfigCtrl.GetData);

module.exports = router;

