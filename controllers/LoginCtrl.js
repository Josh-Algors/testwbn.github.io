const db = require('../database/db');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const helpers = require('../config/helpers');
var uuid = require('node-uuid');
var moment = require('moment');
const otpMail = require('../mailer/otpMail');

module.exports = {

  confirmEmail: async (req, res, next) => {

    const loginSchema = Joi.object().keys({
      email: Joi.string().required(),
    }).unknown();

    const validate = Joi.validate(req.body, loginSchema)

    if (validate.error != null) {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    var user = await db.User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (user) {
      // user has already registered
      // register, login,  activation

      var next = "login";

      if (parseInt(user.activation) == 1) {
        next = "login";
      }
      else {
        next = "activation";
        //send otp to email
      }

      return res.status(200).json({
        success: {
          message: 'Email validated successfully',
          exist: true,
          next: next
        }
      });
    }
    else {
      //
      return res.status(200).json({
        success: {
          message: 'Email validated successfully',
          exist: false,
          next: "register"
        }
      });
    }

  },

  login: async (req, res, next) => {

    const loginSchema = Joi.object().keys({
      email: Joi.string().min(5).required(),
      password: Joi.string().min(5).required(),
    }).unknown();

    const validate = Joi.validate(req.body, loginSchema)

    if (validate.error != null) {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    var user = await db.User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        if (user.activation == 1) {

          const token = helpers.signToken(user); 

          return res.status(200).json({
            success: {
              status: 'SUCCESS',
              accessToken: token, 
              type: user.type
            }
          });
        }
        else {

          //account is not activated 
          //trigger email

          var otp = await helpers.generateClientId(4);

          await db.ActivationCode.destroy({
            where: {
              email: req.body.email
            }
          });

          await db.ActivationCode.create({
            email: user.email,
            otp: otp,
            expiry_date: moment().add(30, 'minutes').format(),
            status: 0,
          });

          //Send email to individual here
          const mail = {
            email: user.email.toLowerCase(),
            otp: otp,
            name: req.body.corporateName
          };

          try {
            //dispatch email
            otpMail.send(mail);
          }
          catch (e) { }

          return res.status(400).json({
            error: {
              status: 'ERROR',
              message: 'Account is not activated, Kindly check your account for activation email.',
              code: '01'
            }
          });

        } 

      }
      else {
        return res.status(400).json({
          error: {
            status: 'ERROR',
            message: "Incorrect Password!",
            code: '00'
          }
        }); 
      }
    }
    else {
      return res.status(400).json({
        error: {
          status: 'ERROR',
          message: "Account does not exist",
        } 
      });
    }

  }

};