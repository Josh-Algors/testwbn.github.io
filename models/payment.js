var Sequelize = require('sequelize');

var PasswordReset = (sequelize, type) => {
  return sequelize.define('payments', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
        
    },
    user_id: Sequelize.STRING,
    deal_uuid: Sequelize.STRING,
    investor_category: Sequelize.STRING,
    description: Sequelize.STRING,
    payment_type: Sequelize.STRING,
    amount: Sequelize.STRING,
    status: Sequelize.INTEGER,
    created_at: Sequelize.DATE
  });
}

module.exports = PasswordReset;
