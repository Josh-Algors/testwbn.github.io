const db = require('../database/db');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const helpers = require('../config/helpers');
var moment = require('moment');
const otpMail = require('../mailer/otpMail');

module.exports = {

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

    const {email, password} = req.body;

    var user = await db.User.findOne({
      where: {
        email: email
      }
    });

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        if (user.status == 1) {

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
              email: email
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
            name: "User"
          };

          try {
            //dispatch email
            otpMail.send(mail);
          }
          catch (e) { }

          return res.status(400).json({
            error: {
              status: 'ERROR',
              message: 'Account is not activated, Kindly check your account for activation code.',
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