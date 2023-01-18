const express = require('express');
const router = express.Router();
require('dotenv').config();

// import controller
var LoginCtrl =  require('../controllers/LoginCtrl');
var RegisterCtrl =  require('../controllers/RegisterCtrl');

//middleware
const signatureSigner = require('../middleware/checkSignature').personalSignature;
var dataGuard;

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

//client-side
router.post('/signup',[signatureSigner, dataGuard], RegisterCtrl.register);
router.post('/activate-account',[signatureSigner, dataGuard], RegisterCtrl.activateAccount);
router.post('/login',[signatureSigner, dataGuard], LoginCtrl.login);
router.post('/resend-otp',[signatureSigner, dataGuard], RegisterCtrl.resendOTP);


module.exports = router; 