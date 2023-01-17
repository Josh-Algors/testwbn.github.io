'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('admins', {
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
      first_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      last_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      phone_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      activation: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      role: {
        allowNull: true,
        type: Sequelize.STRING
      },
      locked: {
        allowNull : true,
        defaultValue: 0,
        type: Sequelize.INTEGER 
      },
      permissions : {
        allowNull : true,
        type: Sequelize.INTEGER
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
     await queryInterface.dropTable('admins');
  }
};
