const request = require('request');
const db  = require('../database/db');
const axios = require('axios');
const jwt_decode = require('jwt-decode');
const jwt = require('jsonwebtoken');
const moment = require('moment');
require('dotenv').config();

const sendError = message => {
    var error = {
        "error": {
            "status": "ERROR",
            "message": message
        }
    }

    return error;
}

const sendSuccess = (message, data = undefined) => {
    var success = {
        "success": {
            "status": "SUCCESS",
            "message": message,
            "data": data
        }
    }

    return success;
}

const checkUserPhone = async function checkUserMobile(req) {
    return await db.User.findOne({ 
        where: {
        mobile: req.body.phoneNumber }
    });
}

const checkUserEmail = async function createUserMail(req) {
    return await db.User.findOne({ 
        where: {
        email: req.body.email }
    });
}

const checkAdminEmail = async function createAdminMail(req) {
    return await db.Admin.findOne({ 
        where: {
        email: req.body.email }
    });
}


const checkBusinessTag = async function checkTag(req) {
    return await db.Business.findOne({ 
        where: {
        tag: req.body.tag }
    });
}

const checkUserToken = async function checkToken(token) {
    return await db.Oauth.findOne({ 
        where: {
        token: token }
    });
}

const checkUserTransaction = async function checkTransaction(reference) {
    return await db.Transaction.findOne({ 
        where: {
        reference: reference }
    });
}

const getConfig = async function getConf(id)
{
    return await db.MyConfig.findOne({ where: { name: "default_business", user_id: id }});
}

const generateOTP = async function generateOTP()
{
    return Math.floor(100000 + Math.random() * 900000);
}

const parsePhone = async function parsePhone(phone)
{
   return "234" + phone.trim().substr(1,10);
}

const timestamp = async  => {
    return Date.now()/1000 | 0;
 }

const authCheck = async function generateOTP(req) {
    if(req.user)
    {
        return true;
    }

    return false;
}

function generateString(length)
{
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
   var charactersLength = characters.length;

   for ( var i = 0; i < length; i++ ) 
   {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   return result;  
}

function formatEmailAsterisk(email){

    var split_email = email.split('@');
    var base_email = split_email[0];
    var domain_email = split_email[1];
    var asterisk_email = base_email.substring(0, 3) + '**********' + base_email.substring(base_email.length - 1, base_email.length) + '@' + domain_email;

    return asterisk_email;
}

function generateClientId(length)
{
   var result           = '';
   var characters       = '123456789123456789123456789';
   var charactersLength = characters.length;

   for ( var i = 0; i < length; i++ ) 
   {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   return result;
}
function generatePassCode(length)
{
   var result           = '';
   var characters       = '012345678901234567890123456789';
   var charactersLength = characters.length;

   for ( var i = 0; i < length; i++ ) 
   {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   return result;
}
const logActivity = async (user, admin, msg) => {
    var name = (user.firstname) ? capitalize(user.firstname) + " " + capitalize(user.lastname) : admin.email;
    await db.AuditLog.create({
        business_id: admin.business_id,
        email: admin.email,
        description: name + " " + msg,
        user: name,
        role: admin.role_name,
    });
}

const signToken = (user) => {

    var token = jwt.sign({
      id: user.id,
      email: user.email,
      firstname: user.first_name,
      lastname: user.last_name,
    },
      process.env.SECRET,
      {
        expiresIn: process.env.SESSION, //1800
      }
    );
  
    var decoded = jwt_decode(token);
    db.Oauth.create(decoded);
    // var checkAdmin = await db.Oauth.findOne()
    return token;
};

const signAdminToken = (admin) => {

    var token = jwt.sign({
      id: admin.id,
      email: admin.email,
      firstname: admin.first_name,
      lastname: admin.last_name,
      admin: 1

    },
      process.env.SECRET,
      {
        expiresIn: process.env.SESSION, //1800
      }
    );
  
    var decoded = jwt_decode(token);
    db.Oauth.create(decoded);
    // var checkAdmin = await db.Oauth.findOne()
    return token;
};


const setDefaultBusiness = async (user, myConfig, id) => {

    if(!myConfig)
    {
        await db.MyConfig.create({
            user_id: user.id,
            name: 'default_business',
            value: id
        });
    }
    else
    {
        myConfig.value = id;
        await myConfig.save();
    }
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function number_format(number, decimals, decPoint, thousandsSep) { // eslint-disable-line camelcase
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
    const n = !isFinite(+number) ? 0 : +number
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    const sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
    const dec = (typeof decPoint === 'undefined') ? '.' : decPoint
    let s = ''
    const toFixedFix = function (n, prec) {
        if (('' + n).indexOf('e') === -1) {
            return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
        } else {
            const arr = ('' + n).split('e')
            let sig = ''
            if (+arr[1] + prec > 0) {
                sig = '+'
            }
            return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec)
        }
    }
    // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || ''
        s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(dec)
}

function base64_decode(base64string)
{
    let bufferObj = Buffer.from(base64string, "base64");
    let decodedString = bufferObj.toString("utf8");
    return decodedString;
}

function base64_encode(originalString)
{
    let bufferObj = Buffer.from(originalString, "utf8");
    let base64String = bufferObj.toString("base64");
    return base64String;
}

function getFundallerData()
{

}

const resolveFundallerAccount = async function fundallerResolve(accountNumber)
{
    //Email check for fundaller
    var check = await db.User.findOne({ where: {email: accountNumber} });

    if(check)
    {
        var wallet = await db.Wallet.findOne({where: { user_id: check.id}});
        return {
            type: 'individual',
            user: check,
            wallet: wallet
        }
    }

    //Username check
    var check = await db.User.findOne({ where: {username: accountNumber} });

    if(check)
    {
        var wallet = await db.Wallet.findOne({where: { user_id: check.id}});
        return {
            type: 'individual',
            user: check,
            wallet: wallet
        }
    }

    //Mobile Number Check
    var check = await db.User.findOne({ where: {mobile: accountNumber} });

    if(check)
    {
        var wallet = await db.Wallet.findOne({where: { user_id: check.id}});
        return {
            type: 'individual',
            user: check,
            wallet: wallet
        }
    }

    //Account Number check (FUndaller)
    var wallet = await db.Wallet.findOne({ where: {account_number: accountNumber} });
    var user = await db.User.findOne({ where: {id: wallet.user_id} });

    if(wallet)
    {
        return {
            type: 'individual',
            user: check,
            wallet: wallet
        }
    }

    //Account Number check (Business)
    var businessWallet = await db.BusinessWallet.findOne({ 
        where: {
            account_number: accountNumber,
        } 
    });

    if(businessWallet)
    {
        var business = await db.Business.findOne({where: { id: businessWallet.id}});
        return {
            type: 'business',
            user: business,
            wallet: businessWallet
        }
    }

    return {
        type: 0,
        user: 0,
        wallet: 0
    }
}

const getBusinessWallet = async function BusinessWallet(accountNumber) {
    return await db.BusinessWallet.findOne({ 
        where: { 
            account_number: accountNumber,
            //business_id: myConfig.value
        }
    });
}

const currentBusinessWallet = async function BusinessWallet(business, accountNumber) {
    return await db.BusinessWallet.findOne({ 
        where: { 
            account_number: accountNumber,
            business_id: business.id
        }
    });
}

const sendNotification = async function sendPush(title, body, token)
{
    var key = process.env.FIREBASE_KEY;

    var param = {
        to: token,
        notification: {
            body: body,
            title: title
        }
    }

    var option = {
        method: 'POST',
        url: 'https://fcm.googleapis.com/fcm/send',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `key=${key}`,
         },
        data : param
      };

    return axios(option)
}

const savingsBalance = async function Balance(saving_id)
{
    var businessSaving = await db.BusinessSaving.findOne({ where: { uuid: saving_id }});

    var cycle = await db.BusinessSavingCycle.findOne({ 
        where: { saving_id: businessSaving.id },
        order: [['id', "DESC"]],
    });

    var credit = await db.BusinessSavingTransaction.sum('amount', 
    { where: { 
            saving_id : businessSaving.id,
            type: 'credit',
            cycle_id: cycle.id,
            status: 'success'
        },
    });

    var debit = await db.BusinessSavingTransaction.sum('amount', 
    { where: { 
            saving_id : businessSaving.id,
            type: 'debit',
            cycle_id: cycle.id,
            status: 'success'
        },
    });

    var interest = await db.BusinessSavingTransaction.sum('interest', 
    { where: { 
            cycle_id: cycle.id,
        },
    });

    var balance = parseFloat(credit) + parseFloat(businessSaving.balance) + parseFloat(interest) - parseFloat(debit);

    return balance;
}

function getNextSavingDate(interval)
{
    var nextDate = moment();

    if(interval == 'monthly')
    {   
        nextDate = nextDate.add(1, 'months').format('YYYY-MM-DD');
    }
    else if(interval == 'weekly')
    {
        nextDate = nextDate.add(1, 'weeks').format('YYYY-MM-DD');
    }
    else
    {
        nextDate = nextDate.add(1, 'days').format('YYYY-MM-DD');
    }

    return nextDate;
}

function transferCharges(amount)
{
    var charge = 0;
    var vat = 0.075;

    if(amount <= 5000)
    {
        charge = 10.75;
    }
    else if(amount > 5000 && amount <= 50000)
    {
        charge = 26.88;
    }
    else if(amount > 50000)
    {
        charge = 53.75;
    }

    return charge;
}


const transferChargeDebit = async (wallet, amount, reference) =>
{
    var amount = parseFloat(amount);
    var charges = transferCharges(amount);

    var wallet = await db.BusinessWallet.findOne({
        where: { id: wallet.id}
    });

    var balance = parseFloat(wallet.amount) - charges;
    wallet.amount = balance;
    await wallet.save();

    var trans_business = await db.BusinessTransaction.create({
        business_id: wallet.business_id,
        account_reference: wallet.account_reference,
        //'bulk' => $res,
        initiator: 0,
        reviewer: 0,
        approver: 0,
        approved_amount: charges,
        amount:  charges,
        balance: balance,
        reference:reference,
        transaction_type: "single",
        type: "charges",
        activity: "debit",
        description: "Transfer Charges + VAT",
        account_number: "XXX...XXX",
        account_name: "Transfer Charges + VAT",
        bank_name: "Providus Bank",
        status: "success",
        transaction_date: moment().format()
    });

    return trans_business;
}

function removeEmojis (string) {
    var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  
    return string.replace(regex, '');
}

const getRate = async () => {
    var rate = await db.Setting.findOne({where: {name: 'buying_rate'}});
    return parseFloat(rate.value);
}

const getOverallTotal = async (data) => {

    var amount = 0;

    for(element of data)
    {
        amount = parseFloat(amount) + parseFloat(element.amount);
    }

    return amount;
}

const parseAirtimeData = async (name) => {

    return await db.BillerData.findOne({
        where: {
            type: name
        }
    });

}

function getTotalAmount(arr){
    var amount = 0;
    arr.forEach(function (item, index){
        amount = amount + parseFloat(item.amount);
    });
    return amount;
}

function parseAction(status){

    if(status = '1')
    {
        return 'active';
    }
    else
    {
        return 'inactive';
    }
}

const getSettings = async (type) => {
    var rate = await db.Setting.findOne({where: {name: type}});
    return rate.value;
}

const saveSettings = async (type, data) => {
    var rate = await db.Setting.findOne({where: {name: type}});
    rate.value = data;
    return await rate.save();
}

module.exports = {
    authCheck,
    sendError,
    sendSuccess,
    checkUserEmail, 
    checkAdminEmail,
    checkUserPhone, 
    checkUserToken, 
    formatEmailAsterisk,
    generateOTP,
    parsePhone,
    checkUserTransaction,
    timestamp,
    generateString,
    generateClientId,
    generatePassCode,
    getConfig,
    logActivity,
    signToken,
    signAdminToken,
    setDefaultBusiness,
    capitalize,
    number_format,
    base64_decode,
    base64_encode,
    getBusinessWallet,
    getFundallerData,
    resolveFundallerAccount,
    sendNotification,
    savingsBalance,
    getNextSavingDate,
    checkBusinessTag,
    currentBusinessWallet,
    transferCharges,
    transferChargeDebit,
    removeEmojis,
    getRate,
    getOverallTotal,
    parseAirtimeData,
    getTotalAmount,
    parseAction,
    getSettings,
    saveSettings
};