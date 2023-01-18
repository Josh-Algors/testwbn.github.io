require('dotenv').config();
var Sequelize = require('sequelize');

//Connect to DB
var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  define: {
      timestamps: false, // true by default
      freezeTableName: true
  }
});

//Check connection to DB
sequelize
  .authenticate()
  .then(() => {
      console.log('Connection has been established successfully.');
  })
  .catch(err => {
      console.error('Unable to connect to the database:', err);
});

const db = {};

//initialize models
db.User = require('../models/user')(sequelize, Sequelize);
db.Oauth = require('../models/oauth')(sequelize, Sequelize);
db.ActivationCode = require('../models/activation_code')(sequelize, Sequelize);
db.Product = require('../models/product')(sequelize, Sequelize);
db.Cart = require('../models/cart')(sequelize, Sequelize);

db.sequelize = sequelize;
 
//export models
module.exports = db;