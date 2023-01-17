const db = require('../database/db');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const helpers = require('../config/helpers');
var uuid = require('node-uuid');
var moment = require('moment');
const otpMail = require('../mailer/otpMail');
const resetPassword = require('../mailer/sendPasswordReset');
const adminCodeMail = require('../mailer/adminCodeMail');

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

  },

  forgotPassword: async (req, res, next) => {

    const loginSchema = Joi.object().keys({
      email: Joi.string().min(5).required()
    })

    const validate = Joi.validate(req.body, loginSchema)

    if (validate.error != null) {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    var checkUser = await db.User.findOne({where: {email: req.body.email}});

    if(!checkUser){
      return res.status(400).json(helpers.sendError("Account does not exist!"));
    }

    await db.PasswordReset.destroy({where: {user_id: checkUser.user_id}});

    var otp = uuid();

    await db.PasswordReset.create({
      user_id: checkUser.user_id,
      token: otp,
      status: 0,
  });

    const mail = {
      email: req.body.email.toLowerCase(),
      name: checkUser.first_name,
      link: process.env.SITE + "/reset-password/?token=" + otp
    };

    try {
      //dispatch email
      resetPassword.send(mail);
    }
    catch (e) { }

    return res.status(200).json(helpers.sendSuccess("Password reset link has been sent to your email."));

  },

  validateToken: async (req, res, next) => {

    const validateTokenschema = Joi.object().keys({
        token: Joi.string().min(5).required()
    }).unknown();

    const validate = Joi.validate(req.body, validateTokenschema)

    if (validate.error != null) {
        const errorMessage = validate.error.details.map(i => i.message).join('.');
        return res.status(400).json(
            helpers.sendError(errorMessage)
        );
    }

    var token = req.body.token;
    var check = await db.PasswordReset.findOne({ where: { token: token } });

    if (check) {
        if (check.status == 1) {
            return res.status(400).json(
                helpers.sendError("Password Token has been used")
            );
        }

        return res.status(200).json(
            helpers.sendSuccess("Valid Token")
        );
    }

    return res.status(400).json(
        helpers.sendError("Password Token has expired")
    );

  },

  updatePassword: async (req, res, next) => {

    const updatePasswordSchema = Joi.object().keys({
        password: Joi.string().min(5).required(),
        token: Joi.string().min(3).required()
    }).unknown();

    const validate = Joi.validate(req.body, updatePasswordSchema)

    if (validate.error != null) {
        const errorMessage = validate.error.details.map(i => i.message).join('.');
        return res.status(400).json(
            helpers.sendError(errorMessage)
        );
    }

    var getUser = await db.PasswordReset.findOne({ where: { token: req.body.token } });

    if (getUser) {
        var user = await db.User.findOne({ where: { user_id: getUser.user_id } });
        user.password = bcrypt.hashSync(req.body.password);
        await user.save();

        await getUser.destroy();

        return res.status(200).json(
            helpers.sendSuccess("Password updated successfully!")
        );
    }

    return res.status(400).json(
        helpers.sendError("Password Token has expired")
    );
  },

  loginAdmin : async(req, res, next) => {
  const loginSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().min(5).required(),
  }).unknown();

  const validate = Joi.validate(req.body, loginSchema)

  if (validate.error != null) {
    const errorMessage = validate.error.details.map(i => i.message).join('.');
    return res.status(400).json(
      helpers.sendError(errorMessage)
    );
  }

  var admin = await db.Admin.findOne({
    where: {
      email: req.body.email,
      //business_id: '9ab6fa03-aeda-48f8-8e0e-6bba8bc18e83'
    } 
  });

  if (admin) {
    if (bcrypt.compareSync(req.body.password, admin.password)) {
      if(admin.role == "ADMIN"){
        if(admin.locked == 0) {
          const token = helpers.signAdminToken(admin);
  
          return res.status(200).json({
            success: {
              status: 'Admin logged in successfully',
              accessToken: token,
              permissions : admin.permissions,
              uuid : admin.uuid
              // type: admin.type 
            }
          });
        }
        else{
  
          //account locked
          return res.status(400).json({
            error: {
              status: 'ERROR',
              message: 'Account has been locked. Kindly contact the super admin to unlock your account!',
              code: '01'
            }
          });
  
        } 

      }
      else{
        if(admin.locked == 0) {
          const token = helpers.signAdminToken(admin);
          
          return res.status(200).json({
            success: {
              status: 'Super admin logged in successfully',
              accessToken: token,
              permissions : {
                "createAdmin": "true",
                "updateAdmin": "true",
                "deleteAdmin": "true",
                "suspendAdmin": "true",
                "deleteDocument": "true"
              },
              uuid : admin.uuid
              // type: admin.type 

            }
          });
        }
        else{
  
          //account locked
          return res.status(400).json({
            error: {
              status: 'ERROR',
              message: 'Account has been locked. Kindly contact the super admin to unlock your account!',
              code: '01'
            }
          });
  
        } 
        
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