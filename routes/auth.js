const express = require('express');
const router = express.Router();
const passport = require('passport')
require('../config/passport')
require('dotenv').config();

// import controller
var AccountCtrl =  require('../controllers/AccountCtrl');
var ProfileCtrl =  require('../controllers/ProfileCtrl');
var HomeCtrl =  require('../controllers/HomeCtrl');
const { sign } = require('jsonwebtoken');
const LoginCtrl = require('../controllers/LoginCtrl');
const AdminCtrl = require('../controllers/AdminCtrl');
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
router.get('/account-get-profile', [jwtMiddleWare, dataGuard], ProfileCtrl.getProfile);
router.patch('/account/update-profile',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.updateProfile);
router.put('/account/update-password',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.updatePassword);
router.put('/account/set-account-status',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.changeSettingsStatus);

//User deals
router.get('/account/new-deals-updates', [jwtMiddleWare, signatureSigner], ProfileCtrl.getUpdatedDeals);
router.get('/account/current-deals',[jwtMiddleWare, signatureSigner], ProfileCtrl.currentDeals);
router.get('/account/my-deals',[jwtMiddleWare, signatureSigner], ProfileCtrl.userDeals);
router.get('/account/single-deal',[jwtMiddleWare, signatureSigner], ProfileCtrl.singleDeal);
router.get('/account/get-deal-by-type',[jwtMiddleWare, signatureSigner], ProfileCtrl.filterDeals);

//terminate
router.post('/account/deals/terminate-deal', [jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.terminateDeal)

router.get('/account/my-deals-new', [jwtMiddleWare, signatureSigner], ProfileCtrl.myDeals);

//Payment History
router.get('/account/all-payments', [jwtMiddleWare, signatureSigner], ProfileCtrl.myPayments);

//support
router.post('/support/submit-support',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.submitSupport);

//commitment
router.post('/commitment/submit-commitment',[jwtMiddleWare, signatureSigner, dataGuard], ProfileCtrl.sendCommitment);

//all notifications
router.get('/account/notifications',[jwtMiddleWare, signatureSigner], ProfileCtrl.getNotifications);

//************** ADMIN ********************//
//dashboard
router.get('/admin/dashboard',[jwtMiddleWare, signatureSigner], AdminCtrl.dashboard);
router.get('/admin/all-applications', [jwtMiddleWare, signatureSigner], AdminCtrl.allApplications);
router.get('/admin/single-application/', [jwtMiddleWare, signatureSigner], AdminCtrl.singleApplication);
router.put('/admin/update-application-status', [jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.changeApplicationStatus);
router.post('/admin/upload-opportunity', [jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.createDeal);
router.get('/admin/all-opportunities', [jwtMiddleWare, signatureSigner], AdminCtrl.allDeals);
router.get('/admin/single-opportunity/', [jwtMiddleWare, signatureSigner], AdminCtrl.singleDeal);

//commitment-url
router.get('/admin/get-commitment/', [jwtMiddleWare, signatureSigner], AdminCtrl.getCommitment);
router.post('/admin/upload-share-allocation/', [jwtMiddleWare, signatureSigner], AdminCtrl.uploadShareAllocation);

//investors
router.get('/admin/investors/single-investor',[jwtMiddleWare, signatureSigner], AdminCtrl.viewSingleInvestor);
router.get('/admin/investors/all-investors',[jwtMiddleWare, signatureSigner], AdminCtrl.viewAllInvestors);

//investor name 
router.get('/admin/investors/investor-name',[jwtMiddleWare, signatureSigner], AdminCtrl.investorName);

//single investor and company
router.get('/admin/view-user', [jwtMiddleWare, signatureSigner], AdminCtrl.getSingleUser);

//commitments - investors
router.get('/admin/investors/all-investors-interest',[jwtMiddleWare, signatureSigner], AdminCtrl.investorsInterest);
router.get('/admin/deal-commitments',[jwtMiddleWare, signatureSigner], AdminCtrl.dealInterests);

//Companies
router.get('/admin/companies/all-companies',[jwtMiddleWare, signatureSigner], AdminCtrl.getCompanies);
router.get('/admin/companies/view-company',[jwtMiddleWare, signatureSigner], AdminCtrl.viewCompany);

//Deals
router.delete('/admin/deals/delete-deal', [jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.removeDeal);

//Payment
router.get('/admin/payment/all-payments',[jwtMiddleWare, signatureSigner], AdminCtrl.allPayments);
router.post('/admin/payment/confirm-payment', [jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.confirmPayment);

//All Admins
router.get('/admin/account/teams',[jwtMiddleWare, signatureSigner], AdminCtrl.allAdmins);
router.post('/admin/account/invite-member',[jwtMiddleWare, signatureSigner], AdminCtrl.inviteMember);

router.get('/admin/account/all-users',[jwtMiddleWare, signatureSigner], AdminCtrl.getInvestors);

//Send Investors Mails
// router.get('/admin/campaigns', [jwtMiddleWare, signatureSigner], AdminCtrl);
router.post('/admin/campaigns/send-mail', [jwtMiddleWare, signatureSigner], AdminCtrl.sendMailInvestors);
router.post('/admin/campaigns/send-bulk-mail', [jwtMiddleWare, signatureSigner], AdminCtrl.sendBulkMailInvestors);

//All Notifications
router.get('/admin/notifications/all-notifications', [jwtMiddleWare, signatureSigner], AdminCtrl.getNotifications);

//Account Settings
router.get('/admin/account/get-account-profile', [jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.getProfile);
router.put('/admin/account/update-profile',[jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.updateProfile);
router.put('/admin/account/update-password', [jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.updatePassword);
router.put('/admin/account/update-preference', [jwtMiddleWare, signatureSigner, dataGuard], AdminCtrl.changePreference);


// //logout
// router.post('/admin/logout',[jwtMiddleWare, signatureSigner], AccountCtrl.adminLogout);
module.exports = router;   