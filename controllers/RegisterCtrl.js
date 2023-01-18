const db = require('../database/db');
const helpers = require('../config/helpers');
const otpMail = require('../mailer/otpMail');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const moment = require('moment');

module.exports = {

  register: async (req, res, next) => {

    const tagSchema = Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required()
    }).unknown();

    const validate = Joi.validate(req.body, tagSchema)

    if (validate.error != null) 
    {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    var today = new Date();

    var check = await db.User.findOne({
      where: {
        email: req.body.email
      }
    });

    if(check)
    {
      return res.status(400).json(
        helpers.sendError('Email has been used!!!')
      );
    }

    const {email, password, first_name, last_name} = req.body;

    var otp = await helpers.generateClientId(4);
    // var uuid_v = uuid();

    var user = await db.User.create({
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password),
      first_name: first_name,
      last_name: last_name,
      status: 0
    });

    await db.ActivationCode.create({
      email: email,
      otp: otp,
      expiry_date: today.setMinutes(today.getMinutes() + 30),
      status: 0
    })

    //Send email to individual here
    const mail = {
      email: user.email.toLowerCase(),
      otp: otp,
      name: first_name,
    };

    try {
      //dispatch email
      otpMail.send(mail);
    }
    catch (e) { }

    return res.status(200).json({
      success: {
        status: 'SUCCESS',
        message: 'Account created successfully. Please check your email ' + helpers.formatEmailAsterisk(email) + ' for activation code.',
        email: email
      }
    });

  },

  resendOTP: async (req, res, next) => {

    const tagSchema = Joi.object().keys({
      email: Joi.string().required(),
    }).unknown();

    const validate = Joi.validate(req.body, tagSchema)

    if (validate.error != null) {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const {email} = req.body;

    var today = new Date();
    var updateOTP = await db.ActivationCode.findOne({ where: { email: email } });
    var info = await db.User.findOne({ where: { email: email } });

    if(updateOTP)
    {
      await updateOTP.destroy();
    }


    if(!info)
    {
      return res.status(400).json(
        helpers.sendError('Email not found / Account has been activated!')
      );
    } 
    else
    {
        var otp = await helpers.generateClientId(4);
        
        await db.ActivationCode.create({
          email: email,
          otp: otp,
          expiry_date: today.setMinutes(today.getMinutes() + 30),
          status: 0
        });

        //Send email to individual here
        const mail = {
          email: email.toLowerCase(),
          otp: otp,
          name: info.first_name
        };

        try {
          //dispatch email
          otpMail.send(mail);
        }
        catch (e) { 
          return res.status(500).json(helpers.sendError("error occured..."));
        }

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

    const {otp, email} = req.body;

    var activation = await db.ActivationCode.findOne({
      where: {
        email: email,
        otp: otp
      }
    });

    if(activation)
    {
      //check expiry minute

      var user = await db.User.findOne({
        where: {
          email: req.body.email
        }
      });

      user.status = 1;
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