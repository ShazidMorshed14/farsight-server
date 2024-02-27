const express = require("express");
const { isAuth, isAdmin } = require("../../middlewares/auth");
const router = express.Router();

//importing the controllers
const userController = require("../../controllers/admin/user");

router.get("/", isAuth, isAdmin, userController.getAllUsers);
router.put("/:id", isAuth, isAdmin, userController.editUserDetails);

module.exports = router;
