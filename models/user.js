// const { SequelizeScopeError } = require('sequelize');
var Sequelize = require('sequelize');

var User = (sequelize, type) => {
  return sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: Sequelize.STRING,
    account_type: Sequelize.STRING,
    company_name: Sequelize.STRING,
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    password: Sequelize.STRING,
    email: Sequelize.STRING,
    activation: Sequelize.INTEGER,
    description: Sequelize.STRING,
    linkedin: Sequelize.STRING,
    profile_url: Sequelize.STRING,
    phone_number: Sequelize.STRING,
    set_status: Sequelize.TEXT,
  })
}
 
module.exports = User;