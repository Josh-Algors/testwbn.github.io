// const app = express();
const db = require('../database/db');
const otpMail = require('../mailer/adminCodeMail');
const { Op, QueryTypes } = require('sequelize');
const { get } = require('request');
const moment = require('moment');
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
const multer = require('multer');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const fsa = require('fs-extra');
const inviteAdmin = require('../mailer/adminCodeMail');
const hbs = require('handlebars');
const e = require('express');
const { count } = require('console');
const { description } = require('joi/lib/types/lazy');
const singleInvestor = require('../mailer/singleInvestor');
const bulkInvestor = require('../mailer/bulkInvestor');
const sendDeal  = require('../mailer/sendDeal');
const notifyAdminDeal = require('../mailer/notifyAdminDeal');
const scheduleMail = require('node-schedule');
// const { getl, getArrangement } = require('./ProfileCtrl');
// const { getAllNotifications } = require('./AdminCtrl');
// const { compile } = require('handlebars');
require('dotenv').config();


module.exports = {


  dashboard: async (req, res, next) => {

    var applications = await db.Application.count({});
    var approvedApplications = await db.Application.count({ where: { status: 1 } });
    var rejectedApplications = await db.Application.count({ where: { status: 2 } });
    var pendingApplications = await db.Application.count({ where: { status: 0 } });
    var getApplications = await db.Application.findAll({
      attributes: ['uuid', 'company_info', 'capital_raise', 'status', 'created_at'],
      order: [['id', "DESC"]]
    });

    var getCommitments = await db.Commitment.findAll({
      where: { status: {[Op.ne] : 1} },
      order: [['id', "DESC"]]});
    // var investorInterest = await db.InvestorInterest.findAll({});

    arr = [];
    arr_interests = [];

    if (!applications) {
      return res.status(200).json({
        status: "success",
        message: "No applicants found",
        data:
        {
          application_counts: {
            pendingApplications: pendingApplications,
            approved_applicants: approvedApplications,
            rejected_applicants: rejectedApplications,
            all_applications: applications
          },
          recent_applications: {
            uuid: getApplications.uuid,
            company_info: JSON.parse(getApplications.company_info).company_name,
            capital_raise: JSON.parse(getApplications.capital_raise),
            status: getApplications.status,
          },
        }
      })
    }

    for (apps of getApplications) {

      arr.push({
        uuid: apps.uuid,
        company_info: JSON.parse(apps.company_info).company_name,
        application_type: JSON.parse(apps.capital_raise).kind_capital_raise,
        status: apps.status,
        created_at: apps.created_at
      })
    }

    for(commit of getCommitments){

      var findUser = await db.User.findOne({
        where: {id: commit.user_id} 
      });

      if(!findUser){
        continue;
      }

      var name = "";
      if(findUser.account_type == "Investor"){
        name = findUser.first_name + " " + findUser.last_name;
      }
      else if (findUser.account_type == "Company"){
        name = findUser.company_name;
      }
      
  

      var findDeal = await db.Deal.findOne({
        where: {uuid: commit.deal_uuid, status: {[Op.ne]: -1}},
        order: [['id', "DESC"]]
      });

      if(!findDeal){
        continue;
      }

      arr_interests.push({
        id: findUser.id,
        uuid: findDeal.uuid,
        profile_url: findUser.profile_url,
        name: name,
        amount: JSON.parse(findDeal.term_sheet).issue_size,
        company_name: JSON.parse(findDeal.about_company).company_name,
        company_url: JSON.parse(findDeal.about_company).company_logo_url,
        commmitment_url: commit.commitment_url,
        status: commit.status,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Applicants found",
      data:
      {
        application_counts: {
          pendingApplications: pendingApplications,
          approved_applicants: approvedApplications,
          rejected_applicants: rejectedApplications,
          all_applications: applications
        },
        recent_applications: arr,
        all_interests: arr_interests,
      }
    });
  },

  createApplication: async (req, res, next) => {

  },

  allApplications: async (req, res, next) => {

    var getApplications = await db.Application.findAll({
      attributes: ['uuid', 'company_info', 'capital_raise', 'status', 'created_at'],
      order: [['id', "DESC"]]
    });

    if (!getApplications) {
      return res.status(200).json({
        status: "success",
        message: "No applications found",
        data: getApplications
      });
    }
    arr = [];
    for (apps of getApplications) {

      arr.push({
        uuid: apps.uuid,
        company_info: JSON.parse(apps.company_info).company_name,
        application_type: JSON.parse(apps.capital_raise).kind_capital_raise,
        status: apps.status,
        created_at: apps.created_at
      })
    }

    return res.status(200).json(
      {
        status: "success",
        message: "Applications found",
        data: arr
      }
    )

  },

  singleApplication: async (req, res, next) => {

    var application = await db.Application.findOne({ where: { uuid: req.query.uuid }, attributes: { exclude: ['id', 'user_id'] } });

    if (!application) {
      return res.status(400).json(helpers.sendError("No application found"));
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Application found",
        data: {
          uuid: application.uuid,
          fullname: application.fullname,
          role: application.role,
          email: application.email,
          linkedin: application.linkedin,
          company_name: application.company_name,
          company_info: JSON.parse(application.company_info),
          capital_raise: JSON.parse(application.capital_raise),
          documents: JSON.parse(application.documents),
          status: application.status,
        }
      }
    })
  },

  getCompanies: async (req, res, next) => {


    var getCompanies = await db.User.findAll({
      where: { account_type: { [Op.ne]: "Investor" } },
      attributes: ['user_id', 'company_name', 'phone_number', 'email'],
      order: [['id', "DESC"]]
    });

    if (!getCompanies) {
      return res.status(200).json({
        success: {
          status: "success",
          message: "No companies found",
          data: getCompanies
        }
      });
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Companies found",
        data: getCompanies
      }
    }
    )
  },

  getSingleUser: async(req, res, next) => {

    var findUser = await db.User.findOne({where: {user_id: req.user.id}});

    if(!findUser){
      return res.status(400).json(helpers.sendError("User not found!"));
    }

    if(findUser.account_type == "Company"){
      return res.status(200).json(helpers.sendSuccess(findUser));
    }
    else if(findUser.account_type == "Investor"){
      return res.status(200).json(helpers.sendSuccess(findUser));
    }
    return res.status(400).json(helpers.sendError("Invalid account type!"));
  },

  viewCompany: async (req, res, next) => {

    var company = await db.User.findOne({ where: { user_id: req.query.user_id }, attributes: { exclude: ['set_status', 'password', 'created_at', 'updated_at'] } });

    if (!company) {
      return res.status(400).json(helpers.sendError("No company found"));
    }

    var arr_interest = [];
    var arr_investment = [];
    var arr_transaction = [];

    var getInvestorInterests = await db.Commitment.findAll({
      where: { user_id: company.id },
      order: [['id', "DESC"]]
    });

    for(interest of getInvestorInterests){

      var findDeal = await db.Deal.findOne({
        where: {uuid: interest.deal_uuid, status: {[Op.ne]: -1}}
      });

      if(!findDeal){
        continue;
      }

      arr_interest.push({
        uuid: findDeal.uuid,
        name: JSON.parse(findDeal.about_company).company_name,
        commitment_url: interest.commitment_url,
        documents: JSON.parse(findDeal.supporting_documents),
      })
    }

    var getInvestment = await db.Payment.findAll({
      where: {user_id: company.id},
      order: [['id', "DESC"]]
    });

    for(investment of getInvestment){
        var findInvestment = await db.Deal.findOne({
          where: {uuid: investment.deal_uuid, status: {[Op.ne]: -1}}
        });
  
        if(!findInvestment){
          continue;
        }
  
        arr_investment.push({
          uuid: findInvestment.uuid,
          name: JSON.parse(findInvestment.about_company).company_name,
          amount: investment.amount,
          documents: JSON.parse(findInvestment.supporting_documents),
        })
    }

    for(transaction of getInvestment){

      var findTransaction = await db.Deal.findOne({
        where: {uuid: transaction.deal_uuid, status: {[Op.ne]: -1}}
      });

      if(!transaction){
        continue;
      }

      arr_transaction.push({
        uuid: transaction.deal_uuid,
        name: JSON.parse(findTransaction.about_company).company_name,
        amount: transaction.amount,
        created_at: transaction.created_at,
        status: transaction.status,
        payment_type: transaction.payment_type,
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Company found",
        data: {
          company: company,
          interests: arr_interest,
          investments: arr_investment,
          all_transactions: arr_transaction
        }
      }
    })
  },

  changeApplicationStatus: async (req, res, next) => {

    const statusSchema = Joi.object().keys({
      status: Joi.required(),
    }).unknown();

    const result = Joi.validate(req.body, statusSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { status } = req.body;
    var application = await db.Application.findOne({ where: { uuid: req.query.uuid } });

    if (!application) {

      return res.status(200).json({
        status: "success",
        message: "No application found",
      })

    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      status: "success",
      message: "Application status changed",
    });
  },

  createDeal: async (req, res, next) => {

    const checkSchema = Joi.object().keys({
      deal_category: Joi.required()
    }).unknown();

    const { deal_category } = req.body;

    if (deal_category == "debt") {
      const debtSchema = Joi.object().keys({
        debt_type: Joi.required(),
        deal_name: Joi.required(),
        about_deal: Joi.required(),
        term_sheet: Joi.required(),
        about_company: Joi.required(),
        founding_members: Joi.required(),
        supporting_documents: Joi.required(),
        financials: Joi.required(),
        commitment_url: Joi.required()
      }).unknown();

      const checkDebt = Joi.validate(req.body, debtSchema);

      if (checkDebt.error != null) {
        const errorMessage = checkDebt.error.details.map(i => i.message).join('.');
        return res.status(400).json(
          helpers.sendError(errorMessage)
        );
      }

      const { deal_name, debt_type, about_deal, term_sheet, about_company, founding_members, supporting_documents, financials, commitment_url } = req.body;

      var new_uuid = uuid();
      await db.Deal.create({
        uuid: new_uuid,
        deal_name: deal_name,
        deal_category: deal_category,
        debt_type: debt_type,
        about_deal: about_deal,
        term_sheet: JSON.stringify(term_sheet),
        about_company: JSON.stringify(about_company),
        founding_members: JSON.stringify(founding_members),
        supporting_documents: JSON.stringify(supporting_documents),
        financials: JSON.stringify(financials),
        commitment_url: commitment_url,
      });
      // console.log("i'm here");
      var getInvestors = await db.User.findAll({attributes: ['email']});

      var arr_investors = [];
      for(investor of getInvestors){
          arr_investors.push(investor.email)
      }
      var emails = arr_investors.join(',');
      // return res.status(200).json(emails);
      
      const sendDealMail = {
        email: emails,
        subject: "New Deal - Update",
        message: "A new deal has been created. Please check your dashboard for more details." 
      }

      try{
        sendDeal.send(sendDealMail);
      }catch(e){
        // return res.status(400).json(helpers.sendError("Error sending email"));
      }

      const notifyAdmin = {
        email: req.user.email,
        subject: "New Deal - Uploaded",
      }

      try{
        notifyAdminDeal.send(notifyAdmin);
      }catch(e){
        // return res.status(400).json(helpers.sendError("Error sending email"));
      }
      return res.status(200).json({
        status: "success",
        message: "Deal created",
        uuid: new_uuid
      });

    }
    else if (deal_category == "equity") {
      const equitySchema = Joi.object().keys({
        equity_type: Joi.required()
      }).unknown();

      // const checkEquity = Joi.validate(req.body, equitySchema);

      // if (checkEquity.error != null) {
      //   const errorMessage = checkEquity.error.details.map(i => i.message).join('.');
      //   return res.status(400).json(
      //     helpers.sendError(errorMessage)
      //   );
      // }
      const { equity_type } = req.body;

      if (equity_type == "venture") {
        const ventureSchema = Joi.object().keys({
          deal_name: Joi.required(),
          about_deal: Joi.required(),
          term_sheet: Joi.required(),
          about_company: Joi.required(),
          founding_members: Joi.required(),
          traction: Joi.required(),
          supporting_documents: Joi.required(),
          commitment_url: Joi.required()
        }).unknown();

        const checkVenture = Joi.validate(req.body, ventureSchema);

        if (checkVenture.error != null) {
          const errorMessage = checkVenture.error.details.map(i => i.message).join('.');
          return res.status(400).json(
            helpers.sendError(errorMessage)
          );
        }

        const { deal_name, about_deal, term_sheet, about_company, founding_members, traction, supporting_documents, commitment_url } = req.body;

        var new_uuid = uuid();
        await db.Deal.create({
          uuid: new_uuid,
          deal_name: deal_name,
          deal_category: deal_category,
          debt_type: equity_type,
          about_deal: about_deal,
          term_sheet: JSON.stringify(term_sheet),
          about_company: JSON.stringify(about_company),
          founding_members: JSON.stringify(founding_members),
          traction: JSON.stringify(traction),
          supporting_documents: JSON.stringify(supporting_documents),
          commitment_url: commitment_url,
        });

        var getInvestors = await db.User.findAll({attributes: ['email']});

        var arr_investors = [];
        for(investor of getInvestors){
            arr_investors.push(investor.email)
        }
        var emails = arr_investors.join(',');
        // return res.status(200).json(emails);
        
        const sendDealMail = {
          email: emails,
          subject: "New Deal - Update",
          message: "A new deal has been created. Please check your dashboard for more details." 
        }
  
        try{
          sendDeal.send(sendDealMail);
        }catch(e){
          // return res.status(400).json(helpers.sendError("Error sending email"));
        }
  
        const notifyAdmin = {
          email: req.user.email,
          subject: "New Deal - Uploaded",
        }
  
        try{
          notifyAdminDeal.send(notifyAdmin);
        }catch(e){
          // return res.status(400).json(helpers.sendError("Error sending email"));
        }

        return res.status(200).json({
          status: "success",
          message: "Deal created",
          uuid: new_uuid
        });
      }
      else if (equity_type == "private") {
        const privateSchema = Joi.object().keys({
          deal_name: Joi.required(),
          about_deal: Joi.required(),
          term_sheet: Joi.required(),
          about_company: Joi.required(),
          founding_members: Joi.required(),
          financials: Joi.required(),
          supporting_documents: Joi.required(),
          commitment_url: Joi.required()
        }).unknown();

        const checkPrivate = Joi.validate(req.body, privateSchema);

        if (checkPrivate.error != null) {
          const errorMessage = checkPrivate.error.details.map(i => i.message).join('.');
          return res.status(400).json(
            helpers.sendError(errorMessage)
          );
        }

        const { deal_name, about_deal, term_sheet, about_company, founding_members, supporting_documents, financials, commitment_url } = req.body;

        var new_uuid = uuid();
        await db.Deal.create({
          uuid: new_uuid,
          deal_name: deal_name,
          deal_category: deal_category,
          debt_type: equity_type,
          about_deal: about_deal,
          term_sheet: JSON.stringify(term_sheet),
          about_company: JSON.stringify(about_company),
          founding_members: JSON.stringify(founding_members),
          supporting_documents: JSON.stringify(supporting_documents),
          financials: JSON.stringify(financials),
          commitment_url: commitment_url,
        });

        var getInvestors = await db.User.findAll({attributes: ['email']});

        var arr_investors = [];
        for(investor of getInvestors){
            arr_investors.push(investor.email)
        }
        var emails = arr_investors.join(',');
        // return res.status(200).json(emails);
        
        const sendDealMail = {
          email: emails,
          subject: "New Deal - Update",
          message: "A new deal has been created. Please check your dashboard for more details." 
        }
  
        try{
          sendDeal.send(sendDealMail);
        }catch(e){
          // return res.status(400).json(helpers.sendError("Error sending email"));
        }
  
        const notifyAdmin = {
          email: req.user.email,
          subject: "New Deal - Uploaded",
        }
  
        try{
          notifyAdminDeal.send(notifyAdmin);
        }catch(e){
          // return res.status(400).json(helpers.sendError("Error sending email"));
        }

        return res.status(200).json({
          status: "success",
          message: "Deal created",
          uuid: new_uuid
        });
      }
      else {
        return res.status(400).json(helpers.sendError("Invalid Equity Type!"));
      }
    }

    else if (deal_category == "hybrid") {

      const hybridSchema = Joi.object().keys({
        deal_name: Joi.required(),
        about_deal: Joi.required(),
        debt_term_sheet: Joi.required(),
        equity_term_sheet: Joi.required(),
        about_company: Joi.required(),
        founding_members: Joi.required(),
        financials: Joi.required(),
        supporting_documents: Joi.required(),
        commitment_url: Joi.required()
      }).unknown();

      const checkHybrid = Joi.validate(req.body, hybridSchema);

      if (checkHybrid.error != null) {
        const errorMessage = checkHybrid.error.details.map(i => i.message).join('.');
        return res.status(400).json(
          helpers.sendError(errorMessage)
        );
      }

      const { deal_name, about_deal, debt_term_sheet, equity_term_sheet, about_company, founding_members, supporting_documents, financials, commitment_url } = req.body;

      debt_uuid = uuid();
      equity_uuid = uuid();

      var new_uuid = uuid();
      await db.Deal.create({
        uuid: debt_uuid,
        deal_name: deal_name,
        deal_category: "debt",
        debt_type: "hybrid",
        about_deal: about_deal,
        term_sheet: JSON.stringify(debt_term_sheet),
        about_company: JSON.stringify(about_company),
        founding_members: JSON.stringify(founding_members),
        supporting_documents: JSON.stringify(supporting_documents),
        financials: JSON.stringify(financials),
        commitment_url: commitment_url,
      });

      await db.Deal.create({
        uuid: equity_uuid,
        deal_name: deal_name,
        deal_category: "equity",
        debt_type: "private",
        about_deal: about_deal,
        term_sheet: JSON.stringify(equity_term_sheet),
        about_company: JSON.stringify(about_company),
        founding_members: JSON.stringify(founding_members),
        supporting_documents: JSON.stringify(supporting_documents),
        financials: JSON.stringify(financials),
        commitment_url: commitment_url,
      });

      var getInvestors = await db.User.findAll({attributes: ['email']});

      var arr_investors = [];
      for(investor of getInvestors){
          arr_investors.push(investor.email)
      }
      var emails = arr_investors.join(',');
      // return res.status(200).json(emails);
      
      const sendDealMail = {
        email: emails,
        subject: "New Deal - Update",
        message: "A new deal has been created. Please check your dashboard for more details." 
      }

      try{
        sendDeal.send(sendDealMail);
      }catch(e){
        // return res.status(400).json(helpers.sendError("Error sending email"));
      }

      const notifyAdmin = {
        email: req.user.email,
        subject: "New Deal - Uploaded",
      }

      try{
        notifyAdminDeal.send(notifyAdmin);
      }catch(e){
        // return res.status(400).json(helpers.sendError("Error sending email"));
      }


      return res.status(200).json({
        status: "success",
        message: "Deal(s) created",
        uuids: {
          debt: debt_uuid,
          equity: equity_uuid
        }
      });

    }

    else {
      return res.status(400).json(helpers.sendError("Invalid deal type!"));
    }

  },

  publishDeal: async (req, res, next) => {

    var deal = await db.Deal.findOne({ where: { uuid: req.query.uuid } });

    if (!deal) {

      return res.status(200).json({
        status: "success",
        message: "No deal found",
      })

    }

    deal.status = 1;
    await deal.save();

    return res.status(200).json({
      status: "success",
      message: "Deal published successfully",
    });
  },

  getInvestors: async(req, res, next) => {

    var getUsers = await db.User.findAll({attributes: ['first_name', 'last_name', 'email']});

    var arr = [];

    for(user of getUsers){
      arr.push({
        name: user.first_name + " " + user.last_name,
        email: user.email
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: " users fetched successfully!",
        users: arr
      }
    })
  },

  removeDeal: async (req, res, next) => {

    var getDeal = await db.Deal.findOne({ where: { uuid: req.query.uuid } });

    if (!getDeal) {
      return res.status(200).json({
        status: "success",
        message: "No deal found",
      })
    }

    getDeal.status = -1;
    await getDeal.save();

    return res.status(200).json({
      status: "success",
      message: "Deal removed",
    });

  },

  allPayments: async(req, res, next) => {

    var start = req.query.start;
    var end = req.query.end;
    var payment_type = req.query.type;

    var getPayments = await db.Payment.findAll({
      order: [['id', 'DESC']]
    });

    if(start && end){
      var getPayments = await db.Payment.findAll({
        where: { created_at: { [Op.between]: [start, end] }},
        order: [['id', 'DESC']]
      });
    }
    else if(payment_type){
      var getPayments = await db.Payment.findAll({
        where: { payment_type: { [Op.eq]: payment_type  }},
        order: [['id', 'DESC']]
      });
    }
    else if(payment_type && start && end){
      // end = new Date(end)
      var getPayments = await db.Payment.findAll({
        where: {
          created_at: { [Op.between]: [start, end] },
          payment_type: { [Op.eq]: payment_type }},
        order: [['id', 'DESC']]
      });
    }

   

    if(!getPayments){
      return res.status(400).json({
        success: {
          status: "success",
          message: "No payments found"
        }
      })
    }

    var arr = [];

    for(payment of getPayments){
      
      var findDeal = await db.Deal.findOne({
        where: { uuid: payment.deal_uuid, status: {[Op.ne]: -1} }
      })

      if(!findDeal){
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

  confirmPayment: async (req, res, next) => {


    const paymentSchema = Joi.object().keys({
      investor_category: Joi.required(),
      description: Joi.required(),
      payment_type: Joi.required(),
      amount: Joi.required()
    }).unknown();

    const checkPayment = Joi.validate(req.body, paymentSchema);

    if (checkPayment.error != null) {
      const errorMessage = checkPayment.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    var findDeal = await db.Deal.findOne({ where: { uuid: req.query.deal_uuid } });
    var findUser = await db.User.findOne({ where: { id: req.query.id } });

    const {investor_category, description, payment_type, amount} = req.body;

    if (!findDeal) {
      return res.status(400).json(helpers.sendError("No Deal found!"));
    }
    if (!findUser) {
      return res.status(400).json(helpers.sendError("No user found!"));
    }

    var findPayment = await db.Payment.findOne({where: {user_id: req.query.id, deal_uuid: req.query.deal_uuid}});


    if(findPayment){
      return res.status(400).json(helpers.sendError("Payment already confirmed for this deal!"));
    }

    var checkInterest = await db.Commitment.findOne({where: {user_id: req.query.id, deal_uuid: req.query.deal_uuid}});
    if(!checkInterest){
      return res.status(400).json(helpers.sendError("You have not shown interest in this deal!"));
    }

    checkInterest.status = 1;
    await checkInterest.save();

    await db.Payment.create({
      user_id: req.query.id,
      deal_uuid: req.query.deal_uuid,
      investor_category: investor_category,
      description: description,
      payment_type: payment_type,
      amount: amount,
      status: 1
    });

    return res.status(200).json(helpers.sendSuccess("Payment details saved!"))

  },

  allDeals: async (req, res, next) => {

    var type  = req.query.type; 

    if(type){
      var getAllDeals = await db.Deal.findAll({
        where: { status: { [Op.ne]: -1 }, debt_type: type},
        attributes: ['uuid', 'deal_name', 'debt_type', 'term_sheet', 'status'], order: [['id', "DESC"]]
      });
    }
    else{
    var getAllDeals = await db.Deal.findAll({
      where: { status: { [Op.ne]: -1 } },
      attributes: ['uuid', 'deal_name', 'debt_type', 'term_sheet', 'status'], order: [['id', "DESC"]]
    });
    }
    

    if (!getAllDeals) {
      return res.status(200).json({
        status: "success",
        message: "No deals found",
        data: getAllDeals
      })
    }
    var arr = [];
    for (deal of getAllDeals) {

      arr.push({
        uuid: deal.uuid,
        deal_name: deal.deal_name,
        debt_type: deal.debt_type,
        issue_size: JSON.parse(deal.term_sheet).issue_size,
        min_sub: JSON.parse(deal.term_sheet).min_sub,
        status: deal.status,
      })
    }

    return res.status(200).json(
      {
        status: "success",
        message: "Deals found",
        data: {
          all_deal: arr
        }
      }
    )

  },

  dealInterests: async (req, res, next) => {

    var findAllInterests = await db.Commitment.findAll({
      where: { deal_uuid: req.query.uuid },
      attributes: ['user_id'],
      order: [['id', "DESC"]]
    });


    if (!findAllInterests) {
      return res.status(400).json(helpers.sendError("Invalid UUID/No interests found"))
    }

    var arr = [];
    for (interest of findAllInterests) {
      var user = await db.User.findOne({ where: { id: interest.user_id, account_type: "Investor" }, attributes: ['id', 'user_id', 'first_name', 'last_name', 'email', 'phone_number'] });

      arr.push({
        id: user.id,
        user_id: user.user_id,
        deal_uuid: req.query.uuid,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
      })
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Interests found",
        data: arr
      }
    })
  },

  singleDeal: async (req, res, next) => {

    var deal = await db.Deal.findOne({
      where: { uuid: req.query.uuid },
      include: [{ model: db.Commitment, required: false }]
    });

    if (!deal) {
      return res.status(200).json({
        success: {
          status: "success",
          message: "No deal found",
        }
      })
    }


  
    return res.status(200).json({
      status: "success",
      message: "Deal found",
      data: {
        id: deal.id,
        uuid: deal.uuid,
        deal_name: deal.deal_name,
        deal_category: deal.deal_category,
        debt_type: deal.debt_type,
        about_deal: deal.about_deal,
        term_sheet: JSON.parse(deal.term_sheet),
        about_company: JSON.parse(deal.about_company),
        founding_members: JSON.parse(deal.founding_members),
        traction: JSON.parse(deal.traction),
        financials: JSON.parse(deal.financials),
        supporting_documents: JSON.parse(deal.supporting_documents),
        status: deal.status,
        created_at: deal.created_at

      }
    })

  },

  currentDeals: async (req, res, next) => {

    var getCurrentDeals = await db.Deal.findAll({ attributes: ['uuid', 'deal_name', 'debt_type', 'about_company', 'status'], order: [['id', "DESC"]] });

    if (!getCurrentDeals) {
      return res.status(200).json({
        status: "success",
        message: "No deals found",
        data: {
          allCurrentDeals: getCurrentDeals,
        }
      })
    }

    return res.status(200).json({
      status: "success",
      message: "Current deals found",
      data: {
        allCurrentDeals: getCurrentDeals
      }
    })
  },

  getSingleCurrentDeals: async (req, res, next) => {

    var getSingleCurrentDeals = await db.Deal.findOne({ where: { uuid: req.query.uuid, status: {[Op.ne]: -1}} });

    if (!getSingleCurrentDeals) {
      return res.status(200).json({
        status: "success",
        message: "No deal found",
        data: {
          allCurrentDeals: getSingleCurrentDeals,
        }
      })
    }

    return res.status(200).json({
      status: "success",
      message: "Deals found",
      data: {
        allCurrentDeals: getSingleCurrentDeals
      }
    })
  },

  sendMailInvestors: async (req, res, next) => {

    const mailSchema = Joi.object().keys({
      email_option: Joi.required(),
      scheduled: Joi.string(),
      value: Joi.required()
    }).unknown();

    const result = Joi.validate(req.body, mailSchema);
  
      if (result.error != null) {
        const errorMessage = result.error.details.map(i => i.message).join('.');
        return res.status(400).json(
          helpers.sendError(errorMessage)
        );
      }

    const { email_option, value, scheduled} = req.body;

    if (email_option == "single") {

      var findInvestor = await db.User.findOne({where: {email: value.email}});

      if(!findInvestor){
        return res.status(400).json(helpers.sendError("Investor not found!"));
      }

      // var findCommitment = await db.Commitment.findOne({where: {user_id: findInvestor.id, deal_uuid: value.deal_uuid}});
      const sendSingleMail = {
        email: value.email,
        name: findInvestor.first_name,
        subject: value.subject,
        content: value.content,
        attachment: value.attachments ? value.attachments : "https://app.fundall.io",
      }

      try{
        singleInvestor.send(sendSingleMail);
      }catch(e){

      }

      return res.status(200).json(helpers.sendSuccess("Mail sent successfully!"));
    }
    else if (email_option == "bulk") {
      if(scheduled == "true"){
        const scheduleSchema = Joi.object().keys({
          date_to_send: Joi.required()
        }).unknown();

        const mailResult = Joi.validate(req.body, scheduleSchema);
      
          if (mailResult.error != null) {
            const errorMessage = mailResult.error.details.map(i => i.message).join('.');
            return res.status(400).json(
              helpers.sendError(errorMessage)
            );
          }
       
        const { date_to_send } = req.body;

        var new_date = new Date(date_to_send);

        scheduleMail.scheduleJob(new_date, async function(){
          
          for(var i = 0; i < value.length; i++){
            var findInvestor = await db.User.findOne({where: {email: value[i].email}});

            if(!findInvestor){
              continue;
            }
            const sendSingleMail = {
              email: value[i].email,
              name: findInvestor.first_name,
              subject: value[i].subject,
              content: value[i].content,
              attachment: value[i].attachments ? value[i].attachments : "https://app.fundall.io"
            }

            try{
              singleInvestor.send(sendSingleMail);
            }catch(e){

            }
          }
        });
        return res.status(200).json(helpers.sendSuccess("Mail scheduled successfully!"));
      }

      for(var i = 0; i < value.length; i++){
        var findInvestor = await db.User.findOne({where: {email: value[i].email}});

        if(!findInvestor){
          continue;
        }
        const sendSingleMail = {
          email: value[i].email,
          name: findInvestor.first_name,
          subject: value[i].subject,
          content: value[i].content,
          attachment: value[i].attachments
        }

        try{
          singleInvestor.send(sendSingleMail);
        }catch(e){

        }
      }

      return res.status(200).json(helpers.sendSuccess("Mail scheduled successfully!"));
    }
    else{
      return res.status(400).json(helpers.sendError("Invalid email option!"));
    }

  },

  sendBulkMailInvestors: async (req, res, next) => {

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

  viewAllInvestors: async (req, res, next) => {

    var getInvestors = await db.User.findAll({
      where: { account_type: "Investor" },
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone_number'],
      order: [['id', "DESC"]]
    });

    if (!getInvestors) {

      return res.status(200).json({
        success: {
          status: "success",
          message: "No investors found",
          data: getInvestors
        }
      });
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Investor(s) found",
        data: {
          investors: getInvestors
        }
      }
    })
  },

  viewSingleInvestor: async (req, res, next) => {

    var getSingleInvestor = await db.User.findOne({ where: { user_id: req.query.user_id }, attributes: { exclude: ['password', 'account_type', 'createdAt', 'updatedAt'] } });

    if (!getSingleInvestor) {

      return res.status(400).json(helpers.sendError("No investor found"));
    }

    var getInvestorInterests = await db.Commitment.findAll({
      where: { user_id: getSingleInvestor.id },
      attributes: { exclude: ['id'] }
    });
    // var getInvestorInvestments = await db.Investment.findAll({where: {user_id: getSingleInvestor.id}});

    return res.status(200).json({
      success: {
        status: "success",
        message: "Investor found",
        data: {
          investor: getSingleInvestor,
          interests: getInvestorInterests
        }
      }
    })
  },

  investorsInterest: async (req, res, next) => {

    var getInvestorsInterest = await db.User.findAll({
      attributes: ['id', 'user_id', 'first_name', 'last_name', 'email', 'linkedin', 'phone_number', 'profile_url', 'description'],
      include: [{
        model: db.Commitment, attributes: {exclude: ['id', 'company_name']}, required: true
      }]
    });

    if (!getInvestorsInterest) {

      return res.status(400).json(helpers.sendError("No investors found"));
    }

    // return res.status(200).json(getInvestorsInterest.commitments[0]);

    return res.status(200).json({
      success: {
        status: "success",
        message: "Investor(s) found",
        data: getInvestorsInterest
        
      }
    })
  },

  updateProfile: async (req, res, next) => {


    const profileSchema = Joi.object().keys({
      first_name: Joi.string(),
      last_name: Joi.string(),
      email: Joi.string(),
      phone_number: Joi.string()
    }).unknown();

    const result = Joi.validate(req.body, profileSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { first_name, last_name, email, phone_number} = req.body;

    var user = await db.Admin.findOne({ where: { id: req.user.id } });


    if (!user) {
      return res.status(400).json(helpers.sendError("User not found"));
    }

    if (email) {
      var checkUser = await db.Admin.findOne({ where: { email: email } });

      if (checkUser && email != user.email) {
        return res.status(400).json(helpers.sendError("Email already exists"));
      }
    }

    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.phone_number = phone_number;
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
    var user = await db.Admin.findOne({ where: { id: req.user.id } });

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

  inviteMember: async (req, res, next) => {

    const profileSchema = Joi.object().keys({
      email: Joi.string().required(),
      role: Joi.string().required(),
    }).unknown();

    const result = Joi.validate(req.body, profileSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const { email, role } = req.body;

    var checkAdmin = await db.Admin.findOne({ where: { email: email } });

    if (checkAdmin) {
      return res.status(400).json(helpers.sendSuccess("Admin with email address exists already!"));
    }

    var getPassCode = helpers.generatePassCode(8);
    await db.Admin.create({
      email: email,
      password: bcrypt.hashSync(getPassCode),
      role: req.body.role
    });

    const inviteMail = {
      email: email,
      p1: getPassCode[0],
      p2: getPassCode[1],
      p3: getPassCode[2],
      p4: getPassCode[3],
      p5: getPassCode[4],
      p6: getPassCode[5],
      p7: getPassCode[6],
      p8: getPassCode[7]
    };

    try {
      //dispatch email
      inviteAdmin.send(inviteMail);

    }
    catch (e) {

    }

    return res.status(200).json(helpers.sendSuccess("Mail sent successfully!"));

  },

  allAdmins: async (req, res, next) => {

    var allAdmins = await db.Admin.findAll({
      attributes: ["first_name", "last_name", "email", "role"],
      order: [['id', "DESC"]]
    });

    return res.status(200).json({
      success: {
        status: "success",
        message: "admins fetched.",
        data: allAdmins

      }
    })
  },
  
  changePreference: async(req, res, next) => {
    const profileSchema = Joi.object().keys({
      change_status: Joi.string().required()
    }).unknown();

    const result = Joi.validate(req.body, profileSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const {change_status} = req.body;

    var changeStatus = await db.User.findOne({where: {id: req.user.id}});

    if(!changeStatus){
      return res.status(400).json(helpers.sendError("User not found!"));
    }
    
    changeStatus.set_status = JSON.stringify(change_status);
    await changeStatus.save();

    return res.status(200).json(helpers.sendSuccess("Info saved successfully!"));
    
  },

  getProfile: async (req, res, next) => {

    var userDetails = await db.Admin.findOne({ 
      where: { id: req.user.id },
      attributes: ['first_name', 'last_name', 'email', 'phone_number']
    });

    if (!userDetails) {
      return res.status(400).json(helpers.sendError("Admin not found"));
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Admin found",
        data: {
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          email: userDetails.email,
          phone_number: userDetails.phone_number,
        }
      }
    })
  },

  getNotifications: async(req, res, next) => {

    var getAppsToday = await db.Application.findAll({ 
      where: {
      created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } });

    var getCommitmentsToday = await db.Commitment.findAll({ 
      where: { 
      created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } });


      var allapps = [];
      var allinterests = [];

      for(apps of getAppsToday){
        allapps.push({
          id: apps.id,
          uuid: apps.uuid,
          company_name: JSON.parse(apps.company_info).company_name,
          raise_amount: JSON.parse(apps.capital_raise).raise_amount
        })
      }

      for(commits of getCommitmentsToday){
        var findDeal = await db.Deal.findOne({where: {uuid: commits.deal_uuid, status: {[Op.ne]: -1}}});
        
        if(!findDeal){
          continue;
        }

        var findUser = await db.User.findOne({where: {id: commits.user_id}});
        
        if(!findUser){
          continue;
        }

        if(findUser.account_type == "Investor"){
          var name = findUser.first_name + " " + findUser.last_name;
        }
        else if(findUser.account_type == "Company"){
          var name = findUser.first_name + " " + findUser.last_name;
        }

        allinterests.push({
          name: name,
          deal_uuid: findDeal.uuid,
          deal_name: findDeal.deal_name,
          deal_category: findDeal.deal_category,
          issue_size: JSON.parse(findDeal.term_sheet).issue_size,
          min_sub: JSON.parse(findDeal.term_sheet).min_sub,
          company_name: JSON.parse(findDeal.about_company).company_name,
          company_logo: JSON.parse(findDeal.about_company).company_logo_url
        })
      }

      return res.status(200).json({
        success: {
          status: "success",
          message: "Notifications found!",
          notifications: {
            applications : allapps,
            interests: allinterests
          }
        }
      });

  },

  investorName: async(req, res, next) => {

    var findInvestor = await db.User.findOne({where: {id: req.query.id}});

    if(!findInvestor){
      return res.status(400).json(helpers.sendError("Investor not found!"));
    }

    return res.status(200).json({
      success: {
        status: "success",
        message: "Investor found!",
        data: {
          name: findInvestor.first_name + " " + findInvestor.last_name
        }
      }
    });
  },

  getCommitment: async(req, res, next) => {

    if(req.query.uuid && req.query.user_id){

      var findDeal = await db.Commitment.findOne({
        where: {deal_uuid: req.query.uuid, user_id: req.query.user_id, status: {[Op.ne] : 1} },
        attributes: ['id', 'user_id','deal_uuid', 'commitment_url', 'share_allocation_url']
      });

      if(!findDeal){
        return res.status(400).json(helpers.sendError("Deal not found!"));
      }

      return res.status(200).json({
        success: {
          status: "success",
          message: "commitment url found!",
          data: findDeal
        }
      });
    }

    return res.status(400).json(helpers.sendError("no uuid entered!"));
  },

  uploadShareAllocation: async(req, res, next) => {

    const profileSchema = Joi.object().keys({
      share_allocation_file: Joi.string().required()
    }).unknown();

    const result = Joi.validate(req.body, profileSchema);

    if (result.error != null) {
      const errorMessage = result.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const {share_allocation_file} = req.body;

    if(req.query.uuid){
      var findDeal = await db.Commitment.findOne({
        where: {deal_uuid: req.query.uuid, user_id: req.user.id, status: {[Op.ne] : 1} },
      });
      if(!findDeal){
        return res.status(400).json(helpers.sendError("Deal not found!"));
      }
     
      findDeal.share_allocation_url = share_allocation_file;
      await findDeal.save();

      return res.status(200).json(helpers.sendSuccess("Share allocation file uploaded successfully!"));

    }

    return res.status(400).json(helpers.sendError("no uuid entered!"));
  }


}

