const express = require("express");
const router = express.Router();

//importing the controllers
const brandControllers = require("../controllers/brand");
const { isAuth, isAdmin } = require("../middlewares/auth");

router.get("/", brandControllers.getAllBrands);
router.post("/create", isAuth, isAdmin, brandControllers.createBrand);

module.exports = router;
