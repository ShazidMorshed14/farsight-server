const express = require("express");
const { isAuth, isAdmin } = require("../middlewares/auth");
const router = express.Router();
const multer = require("multer");

const upload = multer({});

//importing the controllers
const categoryControllers = require("../controllers/category");

//importing the validator
const {
  ValidateCategoryCreate,
  isCategoryRequestValidated,
} = require("../validators/category");

router.get("/", categoryControllers.getAllCategory);
router.get("/list", categoryControllers.getAllCategoryList);
router.post(
  "/create",
  isAuth,
  isAdmin,
  upload.any(),
  ValidateCategoryCreate,
  isCategoryRequestValidated,
  categoryControllers.createCategory
);
router.put(
  "/update/:id",
  isAuth,
  isAdmin,
  upload.any(),
  ValidateCategoryCreate,
  isCategoryRequestValidated,
  categoryControllers.editCategory
);

module.exports = router;
