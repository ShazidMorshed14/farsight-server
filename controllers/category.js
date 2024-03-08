const slugify = require("slugify");

//importing the category model
const Category = require("../models/category");
const { generateUniqueCode, isArrayAndHasContent } = require("../utils/utils");
const { uploadImagesToCloudinary } = require("../utils/file-upload-helper");

const createCategoryTree = (categories, parentId = null) => {
  let categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter(
      (c) => c.parentId == null || c.parentId == undefined
    );
  } else {
    category = categories.filter((c) => c.parentId == parentId);
  }

  for (let cat of category) {
    categoryList.push({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      categoryImage: cat.categoryImage,
      parentId: cat.parentId,
      //createdBy: cat.createdBy,
      children: createCategoryTree(categories, cat._id),
    });
  }

  return categoryList;
};

const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 }).populate({
      path: "createdBy",
      select: "_id name role",
    });
    if (isArrayAndHasContent(categories)) {
      const categoryTree = categories;
      return res.status(200).json({
        status: 200,
        message: "Categories fetched successfully",
        data: categoryTree,
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Categories fetched successfully",
        data: [],
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ meassge: "Error fetching categories" });
  }
};

const getAllCategoryList = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ _id: -1 }).populate({
      path: "createdBy",
      select: "_id name role",
    });

    return res.status(200).json({
      status: 200,
      message: "Categories list fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ meassge: "Error fetching categories" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const checkCategory = await Category.findOne({ name: req.body.name });

    if (checkCategory) {
      return res.status(409).json({ message: "Same Category Already Exists!" });
    }

    const categoryObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      categoryImage: null,
      categoryAppImage: null,
      createdBy: req.user._id,
    };

    const files = isArrayAndHasContent(req?.files) ? req?.files : [];

    const categoryImageFile = files.filter(
      (file) => file.fieldname !== "appImage"
    );

    const categoryAppImageFile = files.filter(
      (file) => file.fieldname === "appImage"
    );

    //upload category image
    if (isArrayAndHasContent(categoryImageFile)) {
      const categoryPictureResponse = await uploadImagesToCloudinary(
        categoryImageFile,
        res,
        1,
        null
      );

      if (categoryPictureResponse.status == 200) {
        categoryObj.categoryImage = categoryPictureResponse?.data[0]?.img
          ? categoryPictureResponse?.data[0]?.img
          : null;
      } else if (categoryPictureResponse.status == 409) {
        return res.status(409).json({
          status: 409,
          message: categoryPictureResponse.message,
          data: null,
        });
      } else {
        return res.status(categoryPictureResponse.status || 500).json({
          status: categoryPictureResponse.status,
          message: categoryPictureResponse.message,
          data: null,
        });
      }
    }

    //upload category app image
    if (isArrayAndHasContent(categoryAppImageFile)) {
      const categorySubPictureResponse = await uploadImagesToCloudinary(
        categoryAppImageFile,
        res,
        1,
        null
      );

      if (categorySubPictureResponse.status == 200) {
        categoryObj.categoryAppImage = categorySubPictureResponse?.data[0]?.img
          ? categorySubPictureResponse?.data[0]?.img
          : null;
      } else if (categorySubPictureResponse.status == 409) {
        return res.status(409).json({
          status: 409,
          message: categorySubPictureResponse.message,
          data: null,
        });
      } else {
        return res.status(categorySubPictureResponse.status || 500).json({
          status: categorySubPictureResponse.status,
          message: categorySubPictureResponse.message,
          data: null,
        });
      }
    }

    const newCat = new Category(categoryObj);

    await newCat
      .save()
      .then((categoryData) => {
        return res.status(200).json({
          status: 200,
          message: "Category Created successfully",
          data: categoryData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.log(error);
  }
};

const editCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    let categoryObj = {
      createdBy: req.user._id,
    };

    const selectedCategory = await Category.findOne({ _id: id });

    //check if the category actually exists or not
    if (!selectedCategory) {
      return res.status(404).json({ message: "Category Doesn't Exists!" });
    }

    if (name) {
      if (selectedCategory?.name !== name) {
        const checkCategory = await Category.findOne({ name: name });

        if (checkCategory) {
          return res
            .status(409)
            .json({ message: "Same Category Already Exists!" });
        }

        categoryObj.name = name;
        categoryObj.slug = `${slugify(name)}-${generateUniqueCode()}`;
      }
    }

    //check if the images are updated  or not
    if (isArrayAndHasContent(req.files)) {
      const files = isArrayAndHasContent(req?.files) ? req?.files : [];

      const categoryImageFile = files.filter(
        (file) => file.fieldname !== "appImage"
      );

      const categoryAppImageFile = files.filter(
        (file) => file.fieldname === "appImage"
      );

      //upload category image
      if (isArrayAndHasContent(categoryImageFile)) {
        const categoryPictureResponse = await uploadImagesToCloudinary(
          categoryImageFile,
          res,
          1,
          null
        );

        if (categoryPictureResponse.status == 200) {
          categoryObj.categoryImage = categoryPictureResponse?.data[0]?.img
            ? categoryPictureResponse?.data[0]?.img
            : null;
        } else if (categoryPictureResponse.status == 409) {
          return res.status(409).json({
            status: 409,
            message: categoryPictureResponse.message,
            data: null,
          });
        } else {
          return res.status(categoryPictureResponse.status || 500).json({
            status: categoryPictureResponse.status,
            message: categoryPictureResponse.message,
            data: null,
          });
        }
      }

      //upload category app image
      if (isArrayAndHasContent(categoryAppImageFile)) {
        const categorySubPictureResponse = await uploadImagesToCloudinary(
          categoryAppImageFile,
          res,
          1,
          null
        );

        if (categorySubPictureResponse.status == 200) {
          categoryObj.categoryAppImage = categorySubPictureResponse?.data[0]
            ?.img
            ? categorySubPictureResponse?.data[0]?.img
            : null;
        } else if (categorySubPictureResponse.status == 409) {
          return res.status(409).json({
            status: 409,
            message: categorySubPictureResponse.message,
            data: null,
          });
        } else {
          return res.status(categorySubPictureResponse.status || 500).json({
            status: categorySubPictureResponse.status,
            message: categorySubPictureResponse.message,
            data: null,
          });
        }
      }
    }

    await Category.findByIdAndUpdate(id, categoryObj, { new: true })
      .then((categoryData) => {
        return res.status(200).json({
          status: 200,
          message: "Category Updated successfully",
          data: categoryData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.log(error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const checkCategory = await Category.findOne({ _id: id });

    if (!checkCategory) {
      return res.status(404).json({
        status: 404,
        message: "Category Couldn't found",
        data: null,
      });
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      status: 200,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ meassge: "Error deleting category" });
  }
};

module.exports = {
  createCategory,
  getAllCategory,
  getAllCategoryList,
  editCategory,
  deleteCategory,
};
