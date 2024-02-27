const express = require("express");
const { isAuth, isAdmin } = require("../middlewares/auth");
const router = express.Router();
const multer = require("multer");

const upload = multer({});

//importing the controllers
const productControllers = require("../controllers/product");

//importing the validator
const {
  validateProductCreate,
  isProductRequestValidated,
} = require("../validators/product");

router.get("/", productControllers.getAllProduct);
router.post(
  "/create",
  isAuth,
  isAdmin,
  upload.any(),
  validateProductCreate,
  isProductRequestValidated,
  productControllers.createProduct
);

module.exports = router;
