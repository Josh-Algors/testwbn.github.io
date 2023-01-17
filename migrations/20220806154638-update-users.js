'use strict';

module.exports = {
   up: (queryInterface, Sequelize) => {
     return Promise.all([

      queryInterface.addColumn(
        'users', 'company_name',
        {
          allowNull: true,
          type: Sequelize.STRING
        }
      ),
     
     ]);
   },

   down: (queryInterface, Sequelize) => {
    
   }
};