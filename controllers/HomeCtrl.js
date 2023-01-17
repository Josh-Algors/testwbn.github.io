const db = require('../database/db');
const helpers = require('../config/helpers');
var uuid = require('node-uuid');
const Joi = require('joi');
const { Op } = require('sequelize');
const { paginate } = require('paginate-info');
const moment = require('moment');
const path = require("path");
const { get } = require('request');
var sequelize = require('sequelize');
require('dotenv').config();

module.exports = {


    currentDeals: async (req, res, next) => {

        var getCurrentDeals = await db.Deal.findAll({
            where: { debt_type: "venture", status: { [Op.ne]: -1 } },
            attributes: ['id', 'uuid', 'deal_name', 'deal_category', 'debt_type', 'term_sheet', 'about_company', 'status'],
            order: [['id', "DESC"]]
        });

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

        for (curr of getCurrentDeals) {
            var findPaidDeals = await db.Payment.findAll({
                where: { deal_uuid: curr.uuid, status: 1 },
                attributes: ['deal_uuid', [sequelize.fn('sum', sequelize.col('amount')), 'total_amount']]
            });

            var values = findPaidDeals.map(function (item) {
                return item.dataValues.total_amount;
            }).reduce(function (a, b) {
                return a + b;
            }, 0);

            // return res.status(200).json(values);
            arr.push({
                id: curr.id,
                uuid: curr.uuid,
                deal_name: curr.deal_name,
                deal_category: curr.deal_category,
                company_name: JSON.parse(curr.about_company).company_name,
                company_logo: JSON.parse(curr.about_company).company_logo_url,
                issue_size: JSON.parse(curr.term_sheet).issue_size,
                min_sub: JSON.parse(curr.term_sheet).min_sub,
                amount_raised: values
            })
        }

        return res.status(200).json({
            status: "success",
            message: "Current deals found",
            data: {
                allCurrentDeals: arr
            }
        })
    },

    submitApplication: async (req, res, next) => {

        const schema = Joi.object().keys({
            fullname: Joi.string().required(),
            role: Joi.string().required(),
            email: Joi.string().required(),
            linkedin: Joi.string().required(),
            company_info: Joi.required(),
            capital_raise: Joi.required(),
            documents: Joi.required(),
        });

        const result = Joi.validate(req.body, schema);

        if (result.error != null) {
            const errorMessage = result.error.details.map(i => i.message).join('.');
            return res.status(400).json(
                helpers.sendError(errorMessage)
            );
        }

        var new_uuid = uuid();
        await db.Application.create({
            uuid: new_uuid,
            fullname: req.body.fullname,
            role: req.body.role,
            email: req.body.email,
            linkedin: req.body.linkedin,
            company_info: JSON.stringify(req.body.company_info),
            capital_raise: JSON.stringify(req.body.capital_raise),
            documents: JSON.stringify(req.body.documents),
            status: 0,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Application submitted successfully',
            uuid: new_uuid
        })

    },

    subscribe: async (req, res, next) => {

        const schema = Joi.object().keys({
            email: Joi.string().required(),
        });

        const result = Joi.validate(req.body, schema);

        if (result.error != null) {
            const errorMessage = result.error.details.map(i => i.message).join('.');
            return res.status(400).json(
                helpers.sendError(errorMessage)
            );
        }

        var new_uuid = uuid();
        await db.Subscriber.create({
            uuid: new_uuid,
            email: req.body.email,
            status: 1,
        });

        return res.status(200).json({
            status: 'success',
            message: 'You have subscribed successfully!'
        });
    },

    counts: async (req, res, next) => {

        var getCompanies = await db.User.count({ where: { account_type: "Company" } });
        var getInvestors = await db.User.count({ where: { account_type: "Investor" } });
        var totalAmountDeals = await db.Payment.findAll({
            attributes: ['amount']
        });

        // var removeComma = replaceAll(totalAmountDeals, ',', '');
        function replaceAll(string, search, replace) {
            return string.split(search).join(replace);
          }

        var initAmount = 0;
        
        for(amounts of totalAmountDeals){
            var newAmount = replaceAll(amounts.amount, ',', '');;
            initAmount += parseInt(newAmount);
        }

        return res.status(200).json({
            success: {
                status: 'success',
                message: 'Counts retrieved successfully',
                data: {
                    companies: getCompanies,
                    investors: getInvestors,
                    totalAmountDeals: initAmount
                }
            }
        });
    }


}