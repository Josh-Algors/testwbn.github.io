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
