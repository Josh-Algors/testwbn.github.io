'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('oauths', {
      no: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING
      },
      iat: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      exp: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      admin: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
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
     await queryInterface.dropTable('oauths');
  }
};
