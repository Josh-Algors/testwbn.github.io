var Sequelize = require('sequelize');

var Product = (sequelize, type) => {
  return sequelize.define('products', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    price: Sequelize.DECIMAL(12,2),
    brand: Sequelize.STRING,
    category: Sequelize.STRING,
    image: Sequelize.STRING,
    status: Sequelize.INTEGER,
  })
}

module.exports = Product;
