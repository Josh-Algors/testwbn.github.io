'use strict';

module.exports = {
   up: (queryInterface, Sequelize) => {
     return Promise.all([

      queryInterface.addColumn(
        'users', 'set_status',
        {
          allowNull: true,
          type: Sequelize.TEXT
        }
      ),
     
     ]);
   },

   down: (queryInterface, Sequelize) => {
    
   }
};