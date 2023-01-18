const helpers = require('../config/helpers');
const db = require('../database/db');
require('dotenv').config();
const Redis = require('ioredis');

const client = new Redis();

module.exports.redisCache = (req,res,next) => {

    const { type } = req.params;

    // ioredis supports the node.js callback style
    client.get(type, (err, result) => {

        if (err) {
            
            next();

        } else {
            if(result !== null){
                console.log("This is from cache");
                return res.status(200).json(JSON.parse(result));
            }
            else{
                next();
            }
        }
    });

    next();
}