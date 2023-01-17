var Sequelize = require('sequelize');

var ActivationCode = (sequelize, type) => {
  return sequelize.define('activation_code', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: Sequelize.STRING,
    otp: Sequelize.STRING,
    expiry_date: Sequelize.STRING,
    status: Sequelize.INTEGER,
  })
}

module.exports = ActivationCode;
