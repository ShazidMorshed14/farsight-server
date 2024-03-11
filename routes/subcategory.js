const express = require("express");
const { isAuth, isAdmin } = require("../middlewares/auth");
const router = express.Router();
const multer = require("multer");

const upload = multer({});

//importing the controllers
const SubCategoryControllers = require("../controllers/subcategory");

//importing the validator
const {
  ValidateCategoryCreate,
  isCategoryRequestValidated,
} = require("../validators/category");

router.get("/", SubCategoryControllers.getAllSubCategory);
router.get("/list", SubCategoryControllers.getAllSubCategory);
router.post(
  "/create",
  isAuth,
  isAdmin,
  upload.any(),
  ValidateCategoryCreate,
  isCategoryRequestValidated,
  SubCategoryControllers.createSubCategory
);
router.put(
  "/update/:id",
  isAuth,
  isAdmin,
  upload.any(),
  ValidateCategoryCreate,
  isCategoryRequestValidated,
  SubCategoryControllers.editSubCategory
);
router.delete(
  "/delete/:id",
  isAuth,
  isAdmin,
  SubCategoryControllers.deleteSubCategory
);
router.post(
  "/remove-category-from-subcategory",
  isAuth,
  isAdmin,
  SubCategoryControllers.removeCategoryFromSubCategory
);

module.exports = router;
