var Sequelize = require('sequelize');

var Commitment = (sequelize, type) => {
  return sequelize.define('commitments', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: Sequelize.STRING,
    deal_uuid: Sequelize.STRING,
    company_name: Sequelize.TEXT,
    commitment_url: Sequelize.STRING,
    share_allocation_url: Sequelize.STRING,
    status: Sequelize.INTEGER,
    created_at: Sequelize.DATE,
  });
}

module.exports = Commitment;
