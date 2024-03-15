const express = require("express");
const multer = require("multer");
const router = express.Router();

//importing the controllers
const shapeControllers = require("../controllers/shape");
const { isAuth, isAdmin } = require("../middlewares/auth");

const upload = multer({});

router.get("/", shapeControllers.getAllShapes);
router.post(
  "/create",
  isAuth,
  isAdmin,
  upload.any(),
  shapeControllers.createShape
);

module.exports = router;
