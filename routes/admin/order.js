const express = require("express");
const { isAuth, isVendor, isAdmin } = require("../../middlewares/auth");
const router = express.Router();

//importing the controllers
const adminOrderController = require("../../controllers/admin/order");

router.post("/", isAuth, isAdmin, adminOrderController.placeOrder);
router.get("/", isAuth, isAdmin, adminOrderController.getOrders);

module.exports = router;
