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
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    password: Sequelize.STRING,
    email: Sequelize.STRING,
    activation: Sequelize.INTEGER,
    phone_number: Sequelize.STRING,
  })
}
 
module.exports = User;