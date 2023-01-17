const express = require('express');
const router = express.Router();
require('dotenv').config();

// import controller
var LoginCtrl =  require('../controllers/LoginCtrl');
var RegisterCtrl =  require('../controllers/RegisterCtrl');
const ProfileCtrl = require('../controllers/ProfileCtrl');
const { sign } = require('jsonwebtoken');
const { default: jwtDecode } = require('jwt-decode');
//var GetConfigCtrl =  require('../controllers/GetConfigCtrl');

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
router.post('/forgot-password',[signatureSigner, dataGuard], LoginCtrl.forgotPassword);
router.post('/validate-token',[signatureSigner, dataGuard], LoginCtrl.validateToken);
router.post('/update-password',[signatureSigner, dataGuard], LoginCtrl.updatePassword);


module.exports = router; 