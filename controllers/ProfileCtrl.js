const db = require('../database/db');
const express = require('express');
const app = express();
// const fs = require('fs');
// var pdf = require("pdf-creator-node");
const Joi = require('joi');
const bcrypt = require('bcryptjs');
var uuid = require('node-uuid');
const helpers = require('../config/helpers');
const base64topdf = require('base64topdf');
const { fileURLToPath } = require('url');
const { uploadImg } = require('../middleware/upload');
const { Op, QueryTypes } = require('sequelize');
const multer = require('multer');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const fsa = require('fs-extra');
var cloudinary = require('cloudinary').v2;
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const { getAllNotifications } = require('./AdminCtrl');
const { User } = require('../database/db');
const { devNull } = require('os');
const { send } = require('../mailer/adminCodeMail');
const { del, get } = require('request');
const { open } = require('fs/promises');
// const { compile } = require('handlebars');
require('dotenv').config();

module.exports = {

  currentDeals: async (req, res, next) => {

    var getCurrentDeals = await db.Deal.findAll({
      where: { status: { [Op.ne]: -1 } },
      attributes: ['id', 'uuid', 'deal_name', 'debt_type', 'about_company', 'term_sheet', 'status'],
      order: [['id', "DESC"]]
    });

    // var getCurrentDealss = await db.Deal.findAll({
    //   where: { status: { [Op.ne]: -1 } },
    //   attributes: ['id', 'uuid', 'deal_name', 'debt_type', 'about_company', 'term_sheet', 'status'],
    //   order: [['id', "DESC"]]
    // });

    if (!getCurrentDeals) {
      return res.status(200).json({
        status: "success",
        message: "No deals found",
        data: {
          allCurrentDeals: getCurrentDeals,
        }
      })
    }



    var arr = [];
    for (currDeal of getCurrentDeals) {

      open_date = JSON.parse(currDeal.term_sheet).indicative_offer_open_date;
      close_date = JSON.parse(currDeal.term_sheet).indicative_offer_close_date;

      if (!open_date) {
        open_date = "";
      }
      if (!close_date) {
        close_date = "";
      }
      if(!open_date || !close_date){
        continue;
      }

      open_offer_date = new Date(open_date);
      close_offer_date = new Date(close_date);

      // console.log(diffDays);
      var currDate = new Date();
      var od = open_offer_date;
      var cd = close_offer_date;
      
      var diffOpenDays = parseInt((od - currDate) / (1000 * 60 * 60 * 24), 10);
      var diffCloseDays = parseInt((cd - currDate) / (1000 * 60 * 60 * 24), 10);

      // console.log(diffOpenDays);
      // console.log(diffCloseDays);

      if (currDate < open_offer_date && currDate < close_offer_date) {
        deal_status = "Coming Soon";
        continue;
      }
      else if (currDate > close_offer_date && currDate > open_offer_date) {
        deal_status = "Closed";
        continue;
      }
      else{
        deal_status = "Live";
      }

      arr.push({
        id: currDeal.id,
        uuid: currDeal.uuid,
        deal_name: currDeal.deal_name,
        deal_category: currDeal.deal_category,
        debt_type: currDeal.debt_type,
        company_url: JSON.parse(currDeal.about_company).company_logo_url,
        company_name: JSON.parse(currDeal.about_company).company_name,
        open_offer_date: open_date,
        close_offer_date: close_date,
        currDate: currDate,
        issue_size: JSON.parse(currDeal.term_sheet).issue_size,
        min_sub: JSON.parse(currDeal.term_sheet).min_sub,
        created_at: currDeal.created_at,
        status: currDeal.status,
        deal_status: deal_status,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Current deals found",
      data: arr
    })

  },

  terminateDeal: async (req, res, next) => {

    var getDeal = await db.Payment.findOne({
      where: { user_id: req.user.id, deal_uuid: req.query.deal_uuid }
    });

    if (!getDeal) {
      return res.status(400).json(helpers.sendError("Invalid deal"));
    }

    await db.Commitment.destroy({
      where: { user_id: req.user.id, deal_uuid: req.query.deal_uuid }
    });

    await db.Payment.update({
      status: 1
    }, {
      where: { deal_uuid: req.query.deal_uuid }
    });

    return res.status(200).json(helpers.sendSuccess("Deal terminated successfully!"));

  },

  myDeals: async (req, res, next) => {


    var myDeals = await db.Payment.findAll({ where: { user_id: req.user.id } });

    if (!myDeals) {
      return res.status(200).json(helpers.sendSuccess("You don't have any deal."));
    }

    var arr = [];
    for (deal of myDeals) {

      var getUserDeals = await db.Deal.findOne({
        where: {
          uuid: deal.deal_uuid,
          status: { [Op.ne]: -1 }
        },
        order: [['id', "DESC"]]
      });

      if (!getUserDeals) {
        continue;
      }

      arr.push({
        uuid: getUserDeals.uuid,
        deal_name: getUserDeals.deal_name,
        deal_category: getUserDeals.deal_category,
        amount_paid: deal.amount,
        company_url: JSON.parse(getUserDeals.about_company).company_logo_url,
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Deals found",
        my_deals: arr
      }
    });
  },

  userDeals: async (req, res, next) => {


    var myDeals = await db.Payment.findAll({ where: { user_id: req.user.id }, order: [['id', 'DESC']] });

    if (!myDeals) {
      return res.status(200).json(helpers.sendSuccess("You don't have any deal."));
    }

    var arr = [];
    for (deal of myDeals) {

      var getUserDeals = await db.Deal.findOne({
        where: {
          uuid: deal.deal_uuid,
          status: { [Op.ne]: -1 }
        },
        order: [['id', "DESC"]]
      });



      if (!getUserDeals) {
        return res.status(200).json({
          success: {
            status: "success",
            message: "No deals found"
          }
        })
      }

      var checkInterest = await db.Commitment.findOne({ where: { user_id: req.user.id, deal_uuid: deal.deal_uuid } });

      if (!checkInterest) {
        continue;
      }
      else if (checkInterest.status == 1) {
        continue;
      }

      arr.push({
        id: getUserDeals.id,
        user_id: req.user.id,
        uuid: getUserDeals.uuid,
        deal_name: getUserDeals.deal_name,
        deal_category: getUserDeals.deal_category,
        company_logo: JSON.parse(getUserDeals.about_company).company_logo_url,
        company_name: JSON.parse(getUserDeals.about_company).company_name,
        company_url: JSON.parse(getUserDeals.about_company).company_website,
        indicative_offer_open_date: JSON.parse(getUserDeals.term_sheet).indicative_offer_open_date,
        indicative_offer_close_date: JSON.parse(getUserDeals.term_sheet).indicative_offer_close_date,
        issue_size: JSON.parse(getUserDeals.term_sheet).issue_size,
        min_sub: JSON.parse(getUserDeals.term_sheet).min_sub,
        amount_paid: deal.amount,
        status: 1
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Deals found",
        my_deals: arr
      }
    });
  },

  singleDeal: async (req, res, next) => {

    var getSingleDeal = await db.Deal.findOne({ where: { uuid: req.query.uuid, status: { [Op.ne]: -1 } } });

    if (!getSingleDeal) {
      return res.status(200).json({
        status: "success",
        message: "No deals found",
        data: {
          singleDeal: getSingleDeal,
        }
      })
    }

    var checkPaymentStatus = await db.Payment.findOne({ where: { user_id: req.user.id, deal_uuid: req.query.uuid } });

    if (checkPaymentStatus) {
      var myDeal = 1;
    } else {
      var myDeal = 0;
    }

    return res.status(200).json({
      status: "success",
      message: "single deal found",
      data: {
        id: getSingleDeal.id,
        user_id: getSingleDeal.user_id,
        uuid: getSingleDeal.uuid,
        deal_name: getSingleDeal.deal_name,
        deal_category: getSingleDeal.deal_category,
        debt_type: getSingleDeal.debt_type,
        about_deal: getSingleDeal.about_deal,
        term_sheet: JSON.parse(getSingleDeal.term_sheet),
        about_company: JSON.parse(getSingleDeal.about_company),
        founding_members: JSON.parse(getSingleDeal.founding_members),
        traction: JSON.parse(getSingleDeal.traction),
        financials: JSON.parse(getSingleDeal.financials),
        supporting_documents: JSON.parse(getSingleDeal.supporting_documents),
        commitment_url: getSingleDeal.commitment_url,
        status: getSingleDeal.status,
        myDeal: myDeal,
        created_at: getSingleDeal.created_at
      }
    })

  },

  allDealsType: async (req, res, next) => {

    var getDeals = await db.Deal.findAll({
      where: { deal_category: req.query.category, status: { [Op.ne]: -1 } },
      order: [['id', "DESC"]]
    });

    if (!getDeals) {
      return res.status(200).json({
        success: {
          status: "success",
          message: "No deals found",
          all_deals: getDeals
        }
      })
    }

    var arr = [];
    for (deal of getDeals) {
      arr.push({
        uuid: deal.uuid,
        deal_name: deal.deal_name,
        deal_category: deal.deal_category,
        debt_type: deal.debt_type,
        about_deal: deal.about_deal,
        tenor: JSON.parse(deal.term_sheet).tenor,
        issuer: JSON.parse(deal.term_sheet).issuer,
        series: JSON.parse(deal.term_sheet).series,
        issue_size: JSON.parse(deal.term_sheet).issue_size,
        min_sub: JSON.parse(deal.term_sheet).min_sub,
        indicative_offer_open_date: JSON.parse(deal.term_sheet).indicative_offer_open_date,
        indicative_offer_close_date: JSON.parse(deal.term_sheet).indicative_offer_close_date,
        indicative_settlement: JSON.parse(deal.term_sheet).indicative_settlement,
        company_name: JSON.parse(deal.about_company).company_name,
        company_url: JSON.parse(deal.about_company).company_logo_url,
        created_at: deal.created_at,
        status: deal.status,
        days_left: deal.created_at
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Deals found",
        all_deals: arr
      }
    })
  },

  filterDeals: async (req, res, next) => {

    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // a and b are javascript Date objects
    function dateDiffInDays(a, b) {
      // Discard the time and time-zone information.
      const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

      return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }


    var fetchDeals = await db.Deal.findAll({ where: { deal_category: req.query.category, status: { [Op.ne]: -1 } } });

    if (!fetchDeals) {
      return res.status(400).json(helpers.sendError("Invalid category!"));
    }

    if (req.query.type) {
      var fetchDeals = await db.Deal.findAll({
        where: {
          deal_category: req.query.category, debt_type: req.query.type, status: { [Op.ne]: -1 }
        }
      });

    }

    //check closing deals 
    var arr = [];
    var today = new Date();
    for (deal of fetchDeals) {
      var date_one = new Date(JSON.parse(deal.term_sheet).indicative_offer_close_date);
      var date_two = new Date();

      if (dateDiffInDays(date_two, date_one) < 0) {
        var days_left = 0;
      }
      else {
        var days_left = dateDiffInDays(date_two, date_one);
      }

      var totalAmountDeals = await db.Payment.findAll({
        where: { deal_uuid: deal.uuid },
        attributes: ['deal_uuid', 'amount']
      });

      function replaceAll(string, search, replace) {
        return string.split(search).join(replace);
      }

      var initAmount = 0;

      for (amounts of totalAmountDeals) {
        var newAmount = replaceAll(amounts.amount, ',', '');;
        initAmount += parseInt(newAmount);
      }

      if (req.query.closing_deals == "true") {
        if (days_left <= 3) {
          arr.push({
            uuid: deal.uuid,
            deal_name: deal.deal_name,
            deal_category: deal.deal_category,
            debt_type: deal.debt_type,
            about_deal: deal.about_deal,
            tenor: JSON.parse(deal.term_sheet).tenor,
            issuer: JSON.parse(deal.term_sheet).issuer,
            series: JSON.parse(deal.term_sheet).series,
            issue_size: JSON.parse(deal.term_sheet).issue_size,
            min_sub: JSON.parse(deal.term_sheet).min_sub,
            indicative_offer_open_date: JSON.parse(deal.term_sheet).indicative_offer_open_date,
            indicative_offer_close_date: JSON.parse(deal.term_sheet).indicative_offer_close_date,
            indicative_settlement: JSON.parse(deal.term_sheet).indicative_settlement,
            company_name: JSON.parse(deal.about_company).company_name,
            company_url: JSON.parse(deal.about_company).company_logo_url,
            created_at: deal.created_at,
            status: deal.status,
            days_left: days_left,
            amount_raised: initAmount
          })
        }
        continue;
      }

      arr.push({
        uuid: deal.uuid,
        deal_name: deal.deal_name,
        deal_category: deal.deal_category,
        debt_type: deal.debt_type,
        about_deal: deal.about_deal,
        tenor: JSON.parse(deal.term_sheet).tenor,
        issuer: JSON.parse(deal.term_sheet).issuer,
        series: JSON.parse(deal.term_sheet).series,
        issue_size: JSON.parse(deal.term_sheet).issue_size,
        min_sub: JSON.parse(deal.term_sheet).min_sub,
        indicative_offer_open_date: JSON.parse(deal.term_sheet).indicative_offer_open_date,
        indicative_offer_close_date: JSON.parse(deal.term_sheet).indicative_offer_close_date,
        indicative_settlement: JSON.parse(deal.term_sheet).indicative_settlement,
        company_name: JSON.parse(deal.about_company).company_name,
        company_url: JSON.parse(deal.about_company).company_logo_url,
        created_at: deal.created_at,
        status: deal.status,
        days_left: days_left ? days_left : 0,
        amount_raised: initAmount
      })
    }

    arr.sort(function (x, y) {
      return y.days_left - x.days_left;
  });

  console.log(arr);

    return res.status(200).json({
      success: {
        status: "success",
        message: "deals found successfully!",
        data: arr
      }
    });
  },

  sendCommitment: async (req, res, next) => {

    const profileSchema = Joi.object().keys({
      commitment_url: Joi.string().required(),
    }).unknown();

    const result = Joi.validate(req.body, profileSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { commitment_url } = req.body;
    var findCompany = await db.Deal.findOne({ where: { uuid: req.query.uuid, status: { [Op.ne]: -1 } } });

    if (!findCompany) {
      return res.status(400).json(helpers.sendError('No deal found'));

    }

    var findCommitment = await db.Commitment.findOne({ where: { user_id: req.user.id, deal_uuid: req.query.uuid } });

    if (findCommitment) {
      return res.status(400).json(helpers.sendError('You have already sent a commitment!'));
    }

    await db.Commitment.create({
      user_id: req.user.id,
      deal_uuid: req.query.uuid,
      company_name: findCompany.about_company,
      commitment_url: commitment_url,
      status: 0,
    });

    return res.status(200).json(helpers.sendSuccess('Commitment sent successfully!'));

  },

  filterDeal: async (req, res, next) => {

    var getFilterDeal = await db.Deal.findAll({ where: { debt_type: req.query.debt_type, status: { [Op.ne]: -1 } } });

    if (!getFilterDeal) {
      return res.status(200).json({
        status: "success",
        message: "No deals found",
        data: {
          filterDeal: getFilterDeal,
        }
      })
    }

    return res.status(200).json({
      status: "success",
      message: "Filter deal found",
      data: {
        filterDeal: getFilterDeal
      }
    })
  },

  submitSupport: async (req, res, next) => {

    const statusSchema = Joi.object().keys({
      full_name: Joi.required(),
      email: Joi.required(),
      question: Joi.required()
    }).unknown();

    const result = Joi.validate(req.body, statusSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { full_name, email, question } = req.body;

    var new_uuid = uuid();

    await db.Support.create({
      user_id: req.user.id,
      uuid: new_uuid,
      full_name: full_name,
      email: email,
      question: question
    })

    res.status(200).json({
      status: "success",
      message: "response saved successfully"
    })
  },

  updateProfile: async (req, res, next) => {

    const profileSchema = Joi.object().keys({
      first_name: Joi.string(),
      last_name: Joi.string(),
      email: Joi.string(),
      linkedin: Joi.string(),
      profile_url: Joi.string(),
      description: Joi.string(),
      phone_number: Joi.string(),
      set_status: Joi.object()
    }).unknown();

    const result = Joi.validate(req.body, profileSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { first_name, last_name, email, linkedin, profile_url, description, phone_number, set_status } = req.body;

    var user = await User.findOne({ where: { id: req.user.id } });


    if (!user) {
      return res.status(400).json(helpers.sendError("User not found"));
    }



    if (email) {
      var checkUser = await db.User.findOne({ where: { email: email } });

      if (checkUser && email != user.email) {
        return res.status(400).json(helpers.sendError("Email already exists"));
      }
    }

    user.first_name = first_name ? first_name : user.first_name;
    user.last_name = last_name ? last_name : user.last_name;
    user.email = email ? email : user.email;
    user.linkedin = linkedin ? linkedin : user.linkedin;
    user.profile_url = profile_url ? profile_url : user.profile_url;
    user.description = description ? description : user.description;
    user.phone_number = phone_number ? phone_number : user.phone_number;
    user.set_status = JSON.stringify(set_status) ? JSON.stringify(set_status) : user.set_status;
    await user.save();

    return res.status(200).json(helpers.sendSuccess("Info updated successfully"));



  },

  updatePassword: async (req, res, next) => {

    const profileSchema = Joi.object().keys({
      old_password: Joi.string().required(),
      new_password: Joi.string().required(),
    }).unknown();

    const result = Joi.validate(req.body, profileSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { old_password, new_password } = req.body;
    var user = await User.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(400).json(helpers.sendError("User not found"));
    }
    else {
      if (bcrypt.compareSync(old_password, user.password)) {

        user.password = bcrypt.hashSync(new_password);
        await user.save();

        return res.status(200).json(helpers.sendSuccess("Password updated successfully"));
      }
      return res.status(400).json(helpers.sendError("Old password is incorrect"));
    }


  },

  getCurrentDeals: async (req, res, next) => {

    console.log(req.user.id);
    var allDeals = await db.Deal.findAll({ where: { uuid: req.user.id, status: { [Op.ne]: -1 } } });

    if (!allDeals) {
      return res.status(400).json({
        status: "success",
        message: "No deals found",
        data: allDeals
      })
    }
    else {
      return res.status(200).json({
        status: "success",
        message: "Deals found",
        data: allDeals
      });
    }
  },

  getUpdatedDeals: async (req, res, next) => {

    var getDealsToday = await db.Deal.findAll({
      where: {
        status: { [Op.ne]: -1 },
        created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }, order: [['id', 'DESC']]
    });

    if (!getDealsToday) {

      return res.status(200).json({
        success: {
          status: "success",
          message: "No deals found",
          data: getDealsToday
        }
      })
    }



    //  return res.status(200).json(deal_status);
    // if (getDealsToday)
    var arr = [];
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // a and b are javascript Date objects
    function dateDiffInDayss(a, b) {
      // Discard the time and time-zone information.
      const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

      return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    currDate = new Date();

    for (getDeal of getDealsToday) {
      var getOpenDate = JSON.parse(getDeal.term_sheet).indicative_offer_open_date;
      var getCloseDate = JSON.parse(getDeal.term_sheet).indicative_offer_close_date;

      if(getOpenDate === "" || getCloseDate === ""){
        continue;
      }
      open_offer_date = new Date(getOpenDate);
      close_offer_date = new Date(getCloseDate);
      
      if (dateDiffInDayss(currDate, open_offer_date) > 0 || open_offer_date == "Invalid Date" || close_offer_date == "Invalid Date") {
        deal_status = "Coming Soon";
        // continue;
      }
      else if (dateDiffInDayss(currDate, open_offer_date) < 0 && dateDiffInDayss(currDate, close_offer_date) < 0) {
        console.log("ddddddd");
        deal_status = "Closed";
        continue;
      }
      else if (dateDiffInDayss(currDate, open_offer_date) < 0 && dateDiffInDayss(currDate, close_offer_date) > 0) {
        console.log("eeeeeee");
        deal_status = "Live";
      }
      else {
        deal_status = "Invalid date";
        continue;
      }
      arr.push({
        id: getDeal.id,
        uuid: getDeal.uuid,
        deal_name: getDeal.deal_name,
        deal_category: getDeal.deal_category,
        about_deal: getDeal.about_deal,
        company_logo: JSON.parse(getDeal.about_company).company_logo_url,
        deal_status: deal_status
      })
    }
    return res.status(200).json({
      success: {
        status: "success",
        message: "Deals found",
        data: arr
      }
    })
  },

  allNotifications: async (req, res, next) => {

    var allNotifications = await db.Notification.findAll({ where: { user_id: req.user.id } });

    if (!allNotifications) {
      return res.status(400).json({
        success: {
          status: "success",
          message: "No notifications found",
          data: allNotifications
        }
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Notifications found",
        data: allNotifications
      }
    });
  },

  myPayments: async (req, res, next) => {

    var start = req.query.start;
    var end = req.query.end;
    var payment_type = req.query.type;

    var getPayments = await db.Payment.findAll({
      where: { user_id: req.user.id },
      order: [['id', 'DESC']]
    });

    if (start && end) {
      var getPayments = await db.Payment.findAll({
        where: { user_id: req.user.id, created_at: { [Op.between]: [start, end] } },
        order: [['id', 'DESC']]
      });
    }
    else if (payment_type) {
      var getPayments = await db.Payment.findAll({
        where: { user_id: req.user.id, payment_type: { [Op.eq]: payment_type } },
        order: [['id', 'DESC']]
      });
    }
    else if (payment_type && start && end) {
      // end = new Date(end)
      var getPayments = await db.Payment.findAll({
        where: {
          user_id: req.user.id,
          created_at: { [Op.between]: [start, end] },
          payment_type: { [Op.eq]: payment_type }
        },
        order: [['id', 'DESC']]
      });
    }



    if (!getPayments) {
      return res.status(400).json({
        success: {
          status: "success",
          message: "No payments found"
        }
      })
    }

    var arr = [];

    for (payment of getPayments) {

      var findDeal = await db.Deal.findOne({
        where: { uuid: payment.deal_uuid, status: { [Op.ne]: -1 } }
      })

      if (!findDeal) {
        continue;
      }

      arr.push({
        payment_id: payment.id,
        created_at: payment.created_at,
        description: payment.description,
        amount: payment.amount,
        payment_type: payment.payment_type,
        status: payment.status,
        deal_name: findDeal.deal_name,
        deal_category: findDeal.deal_category,
        company_name: JSON.parse(findDeal.about_company).company_name
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Payments found",
        data: arr
      }
    })

  },

  getProfile: async (req, res, next) => {

    var userDetails = await db.User.findOne({
      where: { id: req.user.id },
      attributes: ['first_name', 'last_name', 'email', 'phone_number', 'profile_url', 'description', 'linkedin', 'set_status']
    });

    if (!userDetails) {
      return res.status(400).json(helpers.sendError("User not found"));
    }
    var userStatus = JSON.stringify({ "send_email_receipt": "0", "send_deals_everyday": "0" });

    return res.status(200).json({
      success: {
        status: "success",
        message: "User found",
        data: {
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          email: userDetails.email,
          phone_number: userDetails.phone_number,
          profile_url: userDetails.profile_url,
          description: userDetails.description,
          linkedin: userDetails.linkedin,
          set_status: JSON.parse(userDetails.set_status) ? JSON.parse(userDetails.set_status) : JSON.parse(userStatus)
        }
      }
    })
  },

  changeSettingsStatus: async (req, res, next) => {

    const settingSchema = Joi.object().keys({
      "change_status": Joi.required(),
    }).unknown();

    const result = Joi.validate(req.body, settingSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { change_status } = req.body;

    var sendDetails = await db.User.findOne({ where: { id: req.user.id } });

    if (!sendDetails) {
      return res.status(400).json({
        success: {
          status: "success",
          message: "User not found!"
        }
      })
    }

    sendDetails.set_status = JSON.stringify(change_status);
    await sendDetails.save();

    return res.status(200).json({
      success: {
        status: "success",
        message: "Details saved successfully!"
      }
    })
  },

  getNotifications: async (req, res, next) => {

    var confirmedPayments = await db.Payment.findAll({
      where: {
        user_id: req.user.id,
        created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    var dealsLC = await db.Commitment.findAll({
      where: {
        user_id: req.user.id,
        created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    var allConfirmedPayments = [];
    var allDealsLC = [];


    //
    for (confirmed of confirmedPayments) {
      var findDeal = await db.Deal.findOne({ where: { uuid: confirmed.deal_uuid, status: { [Op.ne]: -1 } } });

      if (!findDeal) {
        continue;
      }

      allConfirmedPayments.push({
        user_id: confirmed.user_id,
        payment_type: confirmed.payment_type,
        amount: confirmed.amount,
        status: confirmed.status,
        deal_uuid: findDeal.uuid,
        deal_name: findDeal.deal_name,
        deal_category: findDeal.deal_category,
        company_name: JSON.parse(findDeal.about_company).company_name
      })
    }

    for (dealLC of dealsLC) {
      var findDeal = await db.Deal.findOne({
        where: {
          uuid: dealLC.deal_uuid, status: { [Op.ne]: -1 },
          created_at: { [Op.gt]: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      });

      if (!findDeal) {
        continue;
      }

      var open_offer_date = new Date(JSON.parse(findDeal.term_sheet).indicative_offer_open_date).toLocaleDateString();
      var close_offer_date = new Date(JSON.parse(findDeal.term_sheet).indicative_offer_close_date).toLocaleDateString();

      var currDate = new Date().toLocaleDateString();

      if (currDate < open_offer_date) {
        var deal_status = "Coming Soon";
      }
      else if (currDate > close_offer_date) {
        var deal_status = "Closed";
      }
      else {
        var deal_status = "Live";
      }

      var findUser = await db.User.findOne({ where: { id: dealLC.user_id } });

      if (!findUser) {
        continue;
      }

      if (findUser.account_type == "Investor") {
        var name = findUser.first_name + " " + findUser.last_name;
      }
      else if (findUser.account_type == "Company") {
        var name = findUser.first_name + " " + findUser.last_name;
      }

      allDealsLC.push({
        deal_uuid: findDeal.uuid,
        deal_name: findDeal.deal_name,
        deal_category: findDeal.deal_category,
        deal_type: findDeal.debt_type,
        deal_status: deal_status,
        company_name: JSON.parse(findDeal.about_company).company_name,
        company_logo: JSON.parse(findDeal.about_company).company_logo_url
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Notifications found!",
        notifications: {
          cofirmed_payments: allConfirmedPayments,
          interests: allDealsLC
        }
      }
    });

  }
}
