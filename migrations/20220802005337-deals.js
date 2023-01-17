'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('deals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      uuid: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      deal_category: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      debt_type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      deal_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
     about_deal: {
        allowNull: true,
        type: Sequelize.STRING,
     },
     term_sheet: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      about_company: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      founding_members: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      financials: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      supporting_documents: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      status: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      updated_at: {
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        type: 'TIMESTAMP'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.dropTable('deals');
  }
};
