'use strict';

module.exports = {
   up: (queryInterface, Sequelize) => {
     return Promise.all([

      queryInterface.addColumn(
        'commitments', 'share_allocation_url',
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