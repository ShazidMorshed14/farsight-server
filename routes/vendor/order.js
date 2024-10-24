const express = require("express");
const { isAuth, isVendor } = require("../../middlewares/auth");
const router = express.Router();

//importing the controllers
const vendorOrderController = require("../../controllers/vendor/order");

router.post("/", isAuth, isVendor, vendorOrderController.placeOrder);
router.get("/", isAuth, isVendor, vendorOrderController.getOrders);

module.exports = router;
