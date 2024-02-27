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
    if (categories) {
      const categoryTree = createCategoryTree(categories);
      return res.status(200).json({
        status: 200,
        message: "Categories fetched successfully",
        data: categoryTree,
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
    const { name, type, parentId } = req.body;

    const checkCategory = await Category.findOne({ name: req.body.name });

    if (checkCategory) {
      return res.status(409).json({ message: "Same Category Already Exists!" });
    }

    const categoryObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      type: type,
      parentId: parentId ? parentId : null,
      createdBy: req.user._id,
    };

    const categoryPictureResponse = await uploadImagesToCloudinary(
      req,
      res,
      1,
      100
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

    const { name, type, parentId } = req.body;

    // const checkCategory = await Category.findOne({ name: req.body.name });

    // if (checkCategory) {
    //   return res.status(409).json({ message: "Same Category Already Exists!" });
    // }

    const categoryObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      type: type,
      parentId: parentId ? parentId : null,
      createdBy: req.user._id,
    };

    if (isArrayAndHasContent(req.files)) {
      const categoryPictureResponse = await uploadImagesToCloudinary(
        req,
        res,
        1,
        100
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

module.exports = {
  createCategory,
  getAllCategory,
  getAllCategoryList,
  editCategory,
};
