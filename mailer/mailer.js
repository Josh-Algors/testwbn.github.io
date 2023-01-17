const nodemailer = require('nodemailer');
require('dotenv').config();

var transporter = nodemailer.createTransport({
    host:  process.env.MAIL_HOST,
    port:  process.env.MAIL_PORT,
    auth: {
      user:  process.env.MAIL_USERNAME,
      pass:  process.env.MAIL_PASSWORD
    },
    secure: false,
    tls: {rejectUnauthorized: false},
});

module.exports = {transporter}

