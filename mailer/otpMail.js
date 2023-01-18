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
        defaultLayout: 'otp-mail', // name of main template
    },
    viewPath: __dirname+'/views/',
    extName: '.hbs'
};

const send = async options => {

  
      await transporter.use('compile', hbs(option));

    var chars = options.otp.split('');

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: `${options.email}`,
      subject: "Activate Your Account",
      template: 'otp-mail',
      context: {
        name: `${options.name}`,
        otp1: chars[0],
        otp2: chars[1],
        otp3: chars[2],
        otp4: chars[3],
      }
    };
  
    const info = await transporter.sendMail(message);
    return info;
   
}

module.exports = {send}


