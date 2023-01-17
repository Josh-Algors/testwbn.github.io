'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('commitments', {
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
      deal_uuid: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      company_name: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      commitment_url: {
        allowNull: true,
        type: Sequelize.STRING,
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
     await queryInterface.dropTable('commitments');
  }
};
