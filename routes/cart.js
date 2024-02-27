const express = require("express");
const { isAuth, isAdmin } = require("../middlewares/auth");
const router = express.Router();

//importing the controllers
const cartController = require("../controllers/cart");

router.get("/", isAuth, cartController.getCartItems);
router.post("/add-to-cart", isAuth, cartController.addToCart);

module.exports = router;
