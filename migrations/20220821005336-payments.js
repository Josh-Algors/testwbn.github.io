'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('payments', {
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
      investor_category: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      payment_type: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      amount: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: true,
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
     await queryInterface.dropTable('payments');
  }
};
