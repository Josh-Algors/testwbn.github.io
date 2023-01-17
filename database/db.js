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
db.Application = require('../models/application')(sequelize, Sequelize);
db.Admin = require('../models/admin')(sequelize, Sequelize);
db.Deal = require('../models/deal')(sequelize, Sequelize);
db.Support = require('../models/support')(sequelize, Sequelize);
db.Commitment = require('../models/commitment')(sequelize, Sequelize);
db.Notification = require('../models/notification')(sequelize, Sequelize);
db.PasswordReset = require('../models/password_reset')(sequelize, Sequelize);
db.Payment = require('../models/payment')(sequelize, Sequelize);
db.Subscriber = require('../models/subscriber')(sequelize, Sequelize);


db.User.hasMany(db.Commitment, {foreignKey: 'user_id'});
db.Commitment.belongsTo(db.User, {foreignKey: 'user_id'});

db.Deal.hasMany(db.Commitment, {foreignKey: 'deal_uuid'});
db.Commitment.belongsTo(db.Deal, {foreignKey: 'deal_uuid'});



db.sequelize = sequelize;
 
//export models
module.exports = db;