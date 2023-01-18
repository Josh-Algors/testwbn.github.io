const request = require('request');
const db  = require('../database/db');
const jwt_decode = require('jwt-decode');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const getPaginationData = (data, page, limit) => {
    const { count: totalItems, rows: products } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, products, totalPages, currentPage };
}

const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
}

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

const getConfig = async function getConf(id)
{
    return await db.MyConfig.findOne({ where: { name: "default_business", user_id: id }});
}

const authCheck = async function generateOTP(req) {
    if(req.user)
    {
        return true;
    }

    return false;
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


module.exports = {
    getPaginationData,
    getPagination,
    authCheck,
    sendError,
    sendSuccess,
    formatEmailAsterisk,
    generateClientId,
    generatePassCode,
    getConfig,
    signToken,
};