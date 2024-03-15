const express = require("express");
const router = express.Router();

//importing the controllers
const powerControllers = require("../controllers/power");
const { isAuth, isAdmin } = require("../middlewares/auth");

router.get("/", powerControllers.getAllPowers);
router.post("/create", isAuth, isAdmin, powerControllers.createPower);

module.exports = router;
