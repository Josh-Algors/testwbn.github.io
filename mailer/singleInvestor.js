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
        defaultLayout: 'single-investor', // name of main template
    },
    viewPath: __dirname+'/views/',
    extName: '.hbs'
};

const send = async options => {

  
    await transporter.use('compile', hbs(option));

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: `${options.email}`,
      bcc: 'admin@fundall.io',
      subject: `${options.subject}`,
      template: 'single-investor',
      context: {
        name: `${options.name}`,
        content: `${options.content}`
      },
      attachments: [{
        filename: `${options.attachment}`,
        path: `${options.attachment}`
      }]
    };
  
    const info = await transporter.sendMail(message);
    console.log(info.messageId);
    return info;
  
}

module.exports = {send}


