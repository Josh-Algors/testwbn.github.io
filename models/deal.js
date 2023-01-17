var Sequelize = require('sequelize');

var Application = (sequelize, type) => {
  return sequelize.define('deals', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        
    },
    user_id: Sequelize.STRING,
    uuid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    deal_name: Sequelize.STRING,
    deal_category: Sequelize.STRING,
    debt_type:  Sequelize.STRING,
    about_deal: Sequelize.STRING,
    term_sheet: Sequelize.TEXT,
    about_company: Sequelize.TEXT,
    founding_members: Sequelize.TEXT,
    traction: Sequelize.TEXT,
    financials: Sequelize.TEXT,
    supporting_documents: Sequelize.TEXT,
    commitment_url: Sequelize.STRING,
    status: Sequelize.INTEGER,
    created_at: Sequelize.DATE,
  });
}

module.exports = Application;
