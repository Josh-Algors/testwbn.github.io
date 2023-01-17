const { SequelizeScopeError } = require('sequelize');
var Sequelize = require('sequelize');

var Admin = (sequelize, type) => {
  return sequelize.define('admins', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: Sequelize.STRING,
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    phone_number: Sequelize.STRING,
    activation: Sequelize.INTEGER,
    role: Sequelize.STRING,
    permissions: Sequelize.TEXT,
    locked: Sequelize.INTEGER
  })
}

module.exports = Admin;