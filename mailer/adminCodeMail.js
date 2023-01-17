//const transporter = require('./mailer').transporter;
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
require('dotenv').config();

var transporter = nodemailer.createTransport({
  host:  process.env.MAIL_HOST,
  port:  process.env.MAIL_PORT,
  auth: {
    user:  process.env.MAIL_USERNAME,
    pass:  process.env.MAIL_PASSWORD
  },
  secure:false,
  tls: {rejectUnauthorized: false},
});

var option = {
    viewEngine : {
        extname: '.hbs', // handlebars extension
        layoutsDir: __dirname+'/views/', // location of handlebars templates
        defaultLayout: 'admin-code', // name of main template
    },
    viewPath: __dirname+'/views/',
    extName: '.hbs'
};

const send = async options => {

  
      await transporter.use('compile', hbs(option));

    // var chars = options.otp.split('');

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: `${options.email}`,
      subject: "Admin Login Details",
      template: 'pass-code-mail',
      context: {
        email: `${options.email}`,
        otp1: `${options.p1}`,
        otp2: `${options.p2}`,
        otp3: `${options.p3}`,
        otp4: `${options.p4}`,
        otp5: `${options.p5}`,
        otp6: `${options.p6}`,
        otp7: `${options.p7}`,
        otp8: `${options.p8}`
      }
    };
  
    const info = await transporter.sendMail(message);
    console.log(info.messageId);
    return info;
   
}

module.exports = {send}


