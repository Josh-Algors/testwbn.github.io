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

    next();
}

module.exports = {signatureSignerMiddleware, personalSignature};