const express = require('express');
const router = express.Router();
const passport = require('passport')
require('../config/passport')
require('dotenv').config();

// import controller
var AccountCtrl =  require('../controllers/AccountCtrl');


//middleware

var jwtMiddleWare = passport.authenticate('jwt', {session: false});
const signatureSigner = require('../middleware/checkSignature').personalSignature;
var dataGuard;

if(process.env.APP != 'local')
{
    dataGuard = require('../middleware/decodeJWT').decodeMiddleware;
}
else
{
    dataGuard = (req, res, next) => {
        next()
    }
}

// Routes

//update profile info
router.get('/products', [jwtMiddleWare, dataGuard], AccountCtrl.getProduct);
router.post('/add-to-cart', [jwtMiddleWare, signatureSigner, dataGuard],  AccountCtrl.addToCart);
router.get('/my-orders', [jwtMiddleWare, dataGuard], AccountCtrl.getCartItems);
router.delete('/delete-cart-item',[jwtMiddleWare, signatureSigner, dataGuard], AccountCtrl.deleteCartItem);


module.exports = router;   