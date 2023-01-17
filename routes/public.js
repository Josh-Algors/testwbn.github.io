const express = require('express');
const router = express.Router();
require('dotenv').config();

// import controller
var LoginCtrl =  require('../controllers/LoginCtrl');
var RegisterCtrl =  require('../controllers/RegisterCtrl');
var HomeCtrlSub = require('../controllers/HomeCtrl');
const ProfileCtrl = require('../controllers/ProfileCtrl');
const HomeCtrl = require('../controllers/HomeCtrl');
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
router.get('/current-deals',[signatureSigner, dataGuard], HomeCtrlSub.currentDeals);
router.post('/subscribe', [signatureSigner, dataGuard], HomeCtrlSub.subscribe);
router.get('/analysis', [signatureSigner, dataGuard], HomeCtrlSub.counts);

//get listed applications
router.post('/submit-application',[signatureSigner, dataGuard], HomeCtrl.submitApplication);

//admin-side
router.post('/admin/login',[signatureSigner, dataGuard], LoginCtrl.loginAdmin);

module.exports = router; 