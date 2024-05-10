const express = require("express");
const { isAuth, isVendor } = require("../../middlewares/auth");
const router = express.Router();

//importing the controllers
const vendorUserConroller = require("../../controllers/vendor/user");

router.get(
  "/vendor-details",
  isAuth,
  isVendor,
  vendorUserConroller.getVendorDetails
);

module.exports = router;
