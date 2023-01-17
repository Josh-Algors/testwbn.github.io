const express = require('express');
const router = express.Router();
const passport = require('passport')
require('../config/passport')
require('dotenv').config();

// import controller
var AccountCtrl =  require('../controllers/AccountCtrl');
var ProfileCtrl =  require('../controllers/ProfileCtrl');
const { sign } = require('jsonwebtoken');
const LoginCtrl = require('../controllers/LoginCtrl');
const { Admin } = require('../database/db');


//middleware


var jwtMiddleWare = passport.authenticate('jwt', {session: false});
const signatureSigner = require('../middleware/checkSignature').personalSignature;
var dataGuard;
const imageGuard = require('../middleware/upload').uploadImg;

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

//update profile info
// router.get('/account-get-profile', [jwtMiddleWare, dataGuard], ProfileCtrl.getProfile);
// router.patch('/account/update-profile',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.updateProfile);
// router.put('/account/update-password',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.updatePassword);
// router.put('/account/set-account-status',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.changeSettingsStatus);

// //User deals
// router.get('/account/new-deals-updates', [jwtMiddleWare, signatureSigner], ProfileCtrl.getUpdatedDeals);
// router.get('/account/current-deals',[jwtMiddleWare, signatureSigner], ProfileCtrl.currentDeals);
// router.get('/account/my-deals',[jwtMiddleWare, signatureSigner], ProfileCtrl.userDeals);
// router.get('/account/single-deal',[jwtMiddleWare, signatureSigner], ProfileCtrl.singleDeal);
// router.get('/account/get-deal-by-type',[jwtMiddleWare, signatureSigner], ProfileCtrl.filterDeals);

// //terminate
// router.post('/account/deals/terminate-deal', [jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.terminateDeal)

// router.get('/account/my-deals-new', [jwtMiddleWare, signatureSigner], ProfileCtrl.myDeals);

// //Payment History
// router.get('/account/all-payments', [jwtMiddleWare, signatureSigner], ProfileCtrl.myPayments);

// //support
// router.post('/support/submit-support',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.submitSupport);

// //commitment
// router.post('/commitment/submit-commitment',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.sendCommitment);

// //all notifications
// router.get('/account/notifications',[jwtMiddleWare, signatureSigner], ProfileCtrl.getNotifications);


module.exports = router;   