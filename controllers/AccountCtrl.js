const db = require('../database/db');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const helpers = require('../config/helpers');
// const { default: dist } = require('@node-redis/search');
// const otherItems = require('../models/other_items');
require('dotenv').config();

module.exports = {

  logout: async (req, res, next) => {

    return res.status(200).json({
      "success": {
        "status": "SUCCESS",
        'message': "User logged out successfully"
      }
    });

  },

  adminLogout: async (req, res, next) => {

    return res.status(200).json({
      "success": {
        "status": "SUCCESS",
        'message': "User logged out successfully"
      }
    });

  },


}

