'use strict';

module.exports = {
   up: (queryInterface, Sequelize) => {
     return Promise.all([

      queryInterface.addColumn(
        'deals', 'commitment_url',
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