var Sequelize = require('sequelize');

var Subscriber = (sequelize, type) => {
  return sequelize.define('subscribers', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
        
    },
    uuid: Sequelize.STRING,
    email: Sequelize.STRING,
    status: Sequelize.INTEGER
  });
}

module.exports = Subscriber;
