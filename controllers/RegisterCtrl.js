const db = require('../database/db');
const helpers = require('../config/helpers');
const otpMail = require('../mailer/otpMail');
const bcrypt = require('bcryptjs');
var uuid = require('node-uuid');
const Joi = require('joi');
// const sms = require('../services/sendsms');
// const bvnChecker = require('../services/bvn-validate');
const moment = require('moment');

module.exports = {

  register: async (req, res, next) => {

    const tagSchema = Joi.object().keys({
      account_type: Joi.string().required()
    }).unknown();

    const validate = Joi.validate(req.body, tagSchema)

    if (validate.error != null) {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    var check = await db.User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (check) {
      return res.status(400).json(
        helpers.sendError('Email has been used!!!')
      );
    }

    else {

      if (req.body.account_type == "Investor") {

        const tagSchema = Joi.object().keys({
          email: Joi.string().required(),
          first_name: Joi.string().required(),
          last_name: Joi.string().required(),
          password: Joi.string().required()
        }).unknown();
    
        const validate = Joi.validate(req.body, tagSchema)
    
        if (validate.error != null) {
          const errorMessage = validate.error.details.map(i => i.message).join('.');
          return res.status(400).json(
            helpers.sendError(errorMessage)
          );
        }

        var otp = await helpers.generateClientId(4);
        // var uuid_v = uuid();

        var user = await db.User.create({
          user_id: uuid(),
          password: bcrypt.hashSync(req.body.password),
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email.toLowerCase(),
          account_type: req.body.account_type,
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
          name: req.body.first_name,
        };

        try {
          //dispatch email
          otpMail.send(mail);
        }
        catch (e) { }

        return res.status(200).json({
          success: {
            status: 'SUCCESS',
            message: 'Account created successfully. Please check your email for activation code.',
            email: helpers.formatEmailAsterisk(user.email)
        }
      });
      }
      else {

        const tagSchema = Joi.object().keys({
          email: Joi.string().required(),
          company_name: Joi.string().required(),
          password: Joi.string().required()
        }).unknown();
    
        const validate = Joi.validate(req.body, tagSchema)
    
        if (validate.error != null) {
          const errorMessage = validate.error.details.map(i => i.message).join('.');
          return res.status(400).json(
            helpers.sendError(errorMessage)
          );
        }
        var otp = await helpers.generateClientId(4);
        // var uuid_v = uuid();

        var user = await db.User.create({
          user_id: uuid(),
          password: bcrypt.hashSync(req.body.password),
          company_name: req.body.company_name,
          email: req.body.email.toLowerCase(),
          account_type: req.body.account_type,
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
          name: req.body.company_name,
        };

        try {
          //dispatch email
          otpMail.send(mail);
        }
        catch (e) { }

        return res.status(200).json({
          success: {
            status: 'SUCCESS',
            message: 'Account created successfully. Please check your email for activation code.',
            email: helpers.formatEmailAsterisk(user.email)
        }
      });
      }

    }

  },

  resendOTP: async (req, res, next) => {

    var updateOTP = await db.ActivationCode.findOne({ where: { email: req.body.email } });
    var info = await db.User.findOne({ where: { email: req.body.email } });


    if (!updateOTP && !info) {
      return res.status(400).json(
        helpers.sendError('Email not found / Account has been activated!')
      );


    } else {
      updateOTP.otp = await helpers.generateClientId(4);
      await updateOTP.save();

      //Send email to individual here
      const mail = {
        email: req.body.email.toLowerCase(),
        otp: updateOTP.otp,
        name: info.first_name
      };

      try {
        //dispatch email
        otpMail.send(mail);
      }
      catch (e) { }

      return res.status(200).json(
        helpers.sendSuccess('A new OTP has been sent to your mail!')
      );
    }
  },

  activateAccount: async (req, res, next) => {

    const tagSchema = Joi.object().keys({
      otp: Joi.string().required(),
      email: Joi.string().required(),
    }).unknown();

    const validate = Joi.validate(req.body, tagSchema)

    if (validate.error != null) {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    var activation = await db.ActivationCode.findOne({
      where: {
        email: req.body.email,
        otp: req.body.otp
      }
    });

    if (activation) {

      //check expiry minute

      var user = await db.User.findOne({
        where: {
          email: req.body.email
        }
      });

      user.activation = 1;
      await user.save();

      await activation.destroy();

      const token = helpers.signToken(user);

      return res.status(200).json({
        success: {
          status: 'SUCCESS',
          accessToken: token,
          message: 'Account activated successfully'
          // type: user.type
        }
      });

    }
    else {
      return res.status(400).json(
        helpers.sendError('Invalid OTP code')
      );
    }

  }

}