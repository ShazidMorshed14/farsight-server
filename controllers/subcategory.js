const slugify = require("slugify");

//importing the category model
const Subcategory = require("../models/subcategory");
const { generateUniqueCode, isArrayAndHasContent } = require("../utils/utils");
const { uploadImagesToCloudinary } = require("../utils/file-upload-helper");

const getAllSubCategory = async (req, res) => {
  try {
    const { searchKey, categoryId } = req.query;

    let query = {};

    if (categoryId) {
      query = { categories: { $in: [categoryId] } };
    }

    if (searchKey) {
      query.name = { $regex: searchKey, $options: "i" };
    }

    const subcategories = await Subcategory.find(query)
      .populate("categories")
      .populate({
        path: "createdBy",
        select: "_id name role",
      })
      .sort({ _id: -1 });

    return res.status(200).json({
      status: 200,
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ meassge: "Error fetching categories" });
  }
};

const createSubCategory = async (req, res) => {
  try {
    const { name, categories } = req.body;

    const checkSubCategory = await Subcategory.findOne({ name: req.body.name });

    if (checkSubCategory) {
      return res
        .status(409)
        .json({ message: "Same Sub-Category Already Exists!" });
    }

    const subCategoryObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      subCategoryImage: null,
      subCategoryAppImage: null,
      categories: categories,
      createdBy: req.user._id,
    };

    const files = isArrayAndHasContent(req?.files) ? req?.files : [];

    const SubCategoryImageFile = files.filter(
      (file) => file.fieldname !== "appImage"
    );

    const SubCategoryAppImageFile = files.filter(
      (file) => file.fieldname === "appImage"
    );

    //upload category image
    if (isArrayAndHasContent(SubCategoryImageFile)) {
      const subCategoryPictureResponse = await uploadImagesToCloudinary(
        SubCategoryImageFile,
        res,
        1,
        null
      );

      if (subCategoryPictureResponse.status == 200) {
        subCategoryObj.subCategoryImage = subCategoryPictureResponse?.data[0]
          ?.img
          ? subCategoryPictureResponse?.data[0]?.img
          : null;
      } else if (subCategoryPictureResponse.status == 409) {
        return res.status(409).json({
          status: 409,
          message: subCategoryPictureResponse.message,
          data: null,
        });
      } else {
        return res.status(subCategoryPictureResponse.status || 500).json({
          status: subCategoryPictureResponse.status,
          message: subCategoryPictureResponse.message,
          data: null,
        });
      }
    }

    //upload category app image
    if (isArrayAndHasContent(SubCategoryAppImageFile)) {
      const subCategoryAppImageResponse = await uploadImagesToCloudinary(
        SubCategoryAppImageFile,
        res,
        1,
        null
      );

      if (subCategoryAppImageResponse.status == 200) {
        subCategoryObj.subCategoryAppImage = subCategoryAppImageResponse
          ?.data[0]?.img
          ? subCategoryAppImageResponse?.data[0]?.img
          : null;
      } else if (subCategoryAppImageResponse.status == 409) {
        return res.status(409).json({
          status: 409,
          message: subCategoryAppImageResponse.message,
          data: null,
        });
      } else {
        return res.status(subCategoryAppImageResponse.status || 500).json({
          status: subCategoryAppImageResponse.status,
          message: subCategoryAppImageResponse.message,
          data: null,
        });
      }
    }

    const newCat = new Subcategory(subCategoryObj);

    await newCat
      .save()
      .then((subCategoryData) => {
        return res.status(200).json({
          status: 200,
          message: "Sub-Category Created successfully",
          data: subCategoryData,
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

const editSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, categories } = req.body;

    console.log(name);

    let subCategoryObj = {
      createdBy: req.user._id,
    };

    const selectedSubCategory = await Subcategory.findOne({ _id: id });

    //check if the category actually exists or not
    if (!selectedSubCategory) {
      return res.status(404).json({ message: "Sub-Category Doesn't Exists!" });
    }

    if (name) {
      if (selectedSubCategory?.name !== name) {
        const checkSubCategory = await Subcategory.findOne({ name: name });

        if (checkSubCategory) {
          return res
            .status(409)
            .json({ message: "Same Sub-Category Already Exists!" });
        }

        subCategoryObj.name = name;
        subCategoryObj.slug = `${slugify(name)}-${generateUniqueCode()}`;
      }
    }

    //check if the images are updated  or not
    if (isArrayAndHasContent(req.files)) {
      const files = isArrayAndHasContent(req?.files) ? req?.files : [];

      const SubCategoryImageFile = files.filter(
        (file) => file.fieldname !== "appImage"
      );

      const SubCategoryAppImageFile = files.filter(
        (file) => file.fieldname === "appImage"
      );

      //upload category image
      if (isArrayAndHasContent(SubCategoryImageFile)) {
        const subcategoryPictureResponse = await uploadImagesToCloudinary(
          SubCategoryImageFile,
          res,
          1,
          null
        );

        if (subcategoryPictureResponse.status == 200) {
          subCategoryObj.categoryImage = subcategoryPictureResponse?.data[0]
            ?.img
            ? subcategoryPictureResponse?.data[0]?.img
            : null;
        } else if (subcategoryPictureResponse.status == 409) {
          return res.status(409).json({
            status: 409,
            message: subcategoryPictureResponse.message,
            data: null,
          });
        } else {
          return res.status(subcategoryPictureResponse.status || 500).json({
            status: subcategoryPictureResponse.status,
            message: subcategoryPictureResponse.message,
            data: null,
          });
        }
      }

      //upload category app image
      if (isArrayAndHasContent(SubCategoryAppImageFile)) {
        const SubCategoryAppPictureResponse = await uploadImagesToCloudinary(
          SubCategoryAppImageFile,
          res,
          1,
          null
        );

        if (SubCategoryAppPictureResponse.status == 200) {
          subCategoryObj.categoryAppImage = SubCategoryAppPictureResponse
            ?.data[0]?.img
            ? SubCategoryAppPictureResponse?.data[0]?.img
            : null;
        } else if (SubCategoryAppPictureResponse.status == 409) {
          return res.status(409).json({
            status: 409,
            message: SubCategoryAppPictureResponse.message,
            data: null,
          });
        } else {
          return res.status(SubCategoryAppPictureResponse.status || 500).json({
            status: SubCategoryAppPictureResponse.status,
            message: SubCategoryAppPictureResponse.message,
            data: null,
          });
        }
      }
    }

    if (categories) {
      let createdCategoryList = [...selectedSubCategory.categories];
      createdCategoryList.push(categories);

      subCategoryObj.categories = createdCategoryList;
    }

    await Subcategory.findByIdAndUpdate(id, subCategoryObj, { new: true })
      .then((SubCategoryData) => {
        return res.status(200).json({
          status: 200,
          message: "Sub-Category Updated successfully",
          data: SubCategoryData,
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

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const checkSubCategory = await Subcategory.findOne({ _id: id });

    if (!checkSubCategory) {
      return res.status(404).json({
        status: 404,
        message: "Sub-Category Couldn't found",
        data: null,
      });
    }

    await Subcategory.findByIdAndDelete(id);

    return res.status(200).json({
      status: 200,
      message: "Sub-Category deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ meassge: "Error deleting category" });
  }
};

module.exports = {
  createSubCategory,
  getAllSubCategory,
  editSubCategory,
  deleteSubCategory,
};
