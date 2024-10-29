const express = require("express");

const router = express.Router();
const { isAuth, isVendor } = require("../../middlewares/auth");

//importing the controllers
const productControllers = require("../../controllers/vendor/product");

router.get("/", isAuth, isVendor, productControllers.getAllProduct);

module.exports = router;
