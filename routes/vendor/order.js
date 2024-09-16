const express = require("express");
const { isAuth, isVendor } = require("../../middlewares/auth");
const router = express.Router();

//importing the controllers
const vendorOrderController = require("../../controllers/vendor/order");

router.post("/", isAuth, vendorOrderController.placeOrder);

module.exports = router;
