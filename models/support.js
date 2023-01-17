var Sequelize = require('sequelize');

var Application = (sequelize, type) => {
  return sequelize.define('support-issues', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: Sequelize.STRING,
    uuid: Sequelize.STRING,
    full_name: Sequelize.STRING,
    email: Sequelize.STRING,
    question: Sequelize.TEXT,
    status: Sequelize.INTEGER,
  });
}

module.exports = Application;
