const helpers = require('../config/helpers');
const db = require('../database/db');
require('dotenv').config();

const signatureSignerMiddleware = (req,res,next) =>{

    const hasValue = req.headers.hasOwnProperty("app_id");

    if(!hasValue)
    {
        return res.status(400).json(
            helpers.sendError("APP ID is required")
        );
    }

    // var clientSignature = req.headers.app_id;

    // if(clientSignature !=  process.env.APP_ID)
    // {
    //     return res.status(400).json(
    //         helpers.sendError("Invalid Request..")
    //     );
    // }

    next();
}


const personalSignature = (req,res,next) =>{

    const hasValue = req.headers.hasOwnProperty("app_id");

    if(!hasValue)
    {
        return res.status(400).json(
            helpers.sendError("APP ID is required")
        );
    }

    // var clientSignature = req.headers.app_id;

    // if(clientSignature !=  process.env.APP_ID)
    // {
    //     return res.status(400).json(
    //         helpers.sendError("Invalid Request..")
    //     );
    // }

    next();
}

module.exports = {signatureSignerMiddleware, personalSignature};