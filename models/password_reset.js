var Sequelize = require('sequelize');

var PasswordReset = (sequelize, type) => {
  return sequelize.define('password_resets', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
        
    },
    user_id: Sequelize.STRING,
    token: Sequelize.STRING,
    status: Sequelize.INTEGER,
  });
}

module.exports = PasswordReset;
