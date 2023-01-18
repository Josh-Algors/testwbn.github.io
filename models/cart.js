var Sequelize = require('sequelize');

var Cart = (sequelize, type) => {
  return sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: Sequelize.STRING,
    product_id: Sequelize.STRING,
    price: Sequelize.DECIMAL(12,2),
    quantity: Sequelize.INTEGER,
    status: Sequelize.INTEGER,
  })
}

module.exports = Cart;


// id: {
//     allowNull: false,
//     autoIncrement: true,
//     primaryKey: true,
//     type: Sequelize.INTEGER
//   },
//   product_id: {
//     allowNull: true,
//     type: Sequelize.STRING,
//   },
//   price: {
//     allowNull: true,
//     type: Sequelize.STRING,
//   },
//   quantity: {
//     allowNull: true,
//     type: Sequelize.INTEGER,
//   },
//   status: {
//     allowNull: true,
//     type: Sequelize.INTEGER,
//   },