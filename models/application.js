var Sequelize = require('sequelize');

var Application = (sequelize, type) => {
  return sequelize.define('applications', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: Sequelize.STRING,
    uuid: Sequelize.STRING,
    fullname: Sequelize.STRING,
    role: Sequelize.STRING,
    email: Sequelize.STRING,
    linkedin: Sequelize.STRING,
    company_name: Sequelize.STRING,
    company_info: Sequelize.TEXT,
    capital_raise: Sequelize.TEXT,
    documents: Sequelize.TEXT,
    status: Sequelize.INTEGER,
  });
}

module.exports = Application;
