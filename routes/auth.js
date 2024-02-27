const express = require("express");
const router = express.Router();

//importing the controllers
const userControllers = require("../controllers/user");

router.post("/signup", userControllers.signup);
router.post("/login", userControllers.signin);

module.exports = router;
