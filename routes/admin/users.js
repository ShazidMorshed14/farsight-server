const express = require("express");
const { isAuth, isAdmin } = require("../../middlewares/auth");
const router = express.Router();

//importing the controllers
const userController = require("../../controllers/admin/user");

router.get("/", isAuth, isAdmin, userController.getAllUsers);

module.exports = router;
