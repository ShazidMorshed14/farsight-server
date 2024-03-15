const express = require("express");
const router = express.Router();

//importing the controllers
const colorControllers = require("../controllers/color");
const { isAuth, isAdmin } = require("../middlewares/auth");

router.get("/", colorControllers.getAllColors);
router.post("/create", isAuth, isAdmin, colorControllers.createColor);

module.exports = router;
