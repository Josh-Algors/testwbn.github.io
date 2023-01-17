'use strict';

module.exports = {
   up: (queryInterface, Sequelize) => {
     return Promise.all([

      queryInterface.addColumn(
        'deals', 'traction',
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