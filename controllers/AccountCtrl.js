const db = require('../database/db');
const Joi = require('joi');
require('dotenv').config();

module.exports = {

  addToCart: async(req, res, next) => {
   
    const cartSchema = Joi.object().keys({
      product_id: Joi.string().required()
    }).unknown();

    const validate = Joi.validate(req.body, cartSchema)

    if (validate.error != null) 
    {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const {product_id} = req.body;

    var getProduct = await db.Product.findOne({where: {id: product_id, status: 1}});

    var checkCart = await db.Cart.findOne({where: {user_id: req.user.id, product_id: product_id}});

    if(!getProduct)
    {
      return res.status(400).json(helpers.sendError("Invalid Product Selected!"));
    }

    if(checkCart)
    {
      checkCart.quantity++;
      await checkCart.save();

      return res.status(200).json(helpers.sendSuccess("Product added to cart!"));
    }

    await db.Cart.create({
      user_id: req.user.id,
      product_id: product_id,
      price: getProduct.price,
      quantity: 1
    });

    return res.status(200).json(helpers.sendSuccess("Product added to cart!"));
  },

  getCartItems: async(req, res, next) => {

    var checkCart = await db.Cart.findAll({where: {user_id: req.user.id}, attributes: ['id', 'product_id', 'price', 'quantity']});

    return res.status(200).json({
      success: {
        status: "success",
        message: "Items retrieved successfully!",
        data: checkCart
      }
    });
  },

  deleteCartItem: async(req, res, next) => {

    const cartSchema = Joi.object().keys({
      product_id: Joi.string().required()
    }).unknown();

    const validate = Joi.validate(req.body, cartSchema)

    if (validate.error != null) 
    {
      const errorMessage = validate.error.details.map(i => i.message).join('.');
      return res.status(400).json(
        helpers.sendError(errorMessage)
      );
    }

    const {product_id} = req.body;

    var getProduct = await db.Product.findOne({where: {id: product_id, status: 1}});

    var checkCart = await db.Cart.findOne({where: {user_id: req.user.id, product_id: product_id}});

    if(!getProduct)
    {
      return res.status(400).json(helpers.sendError("Invalid Product Selected!"));
    }

    if(checkCart && (checkCart.quantity != 1))
    {
      checkCart.quantity--;
      await checkCart.save();

      return res.status(200).json(helpers.sendSuccess("Product removed from cart!"));
    }
    else if(checkCart && (checkCart.quantity == 1))
    {
      await checkCart.destroy();
      return res.status(200).json(helpers.sendSuccess("Product removed from cart!"));
    }
    else
    {
      return res.status(200).json(helpers.sendSuccess("Product not found in cart!"));
    }

  },

  getProduct: async(req, res, next) => {
  
    // var products = await db.Product.findAll({where: {status: 1}});
    const { page, size} = req.query;

    const { limit, offset } = helpers.getPagination(page, size);

    var products = await db.Product.findAndCountAll({ where: {status: 1}, limit, offset });

    var datas = await helpers.getPaginationData(products, page, limit);

    return res.status(200).json({
      success: {
        status: "success",
        message: "All products retrieved successfully!",
        data: datas
      }
    })
  },

  logout: async (req, res, next) => {

    return res.status(200).json({
      "success": {
        "status": "SUCCESS",
        'message': "User logged out successfully"
      }
    });

  }


}

