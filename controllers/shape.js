const slugify = require("slugify");

const Shape = require("../models/shape");
const { generateUniqueCode, isArrayAndHasContent } = require("../utils/utils");
const { uploadImagesToCloudinary } = require("../utils/file-upload-helper");

const createShape = async (req, res) => {
  try {
    const { name } = req.body;

    const checkShape = await Shape.findOne({ name: name });

    if (checkShape) {
      return res.status(409).json({ message: "Same Shape Already Exists!" });
    }

    const shapeObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      createdBy: req.user._id,
    };

    const files = isArrayAndHasContent(req?.files) ? req?.files : [];

    //upload category image
    if (isArrayAndHasContent(files)) {
      const featurePictureUploadResponse = await uploadImagesToCloudinary(
        files,
        res,
        1,
        null
      );

      if (featurePictureUploadResponse.status == 200) {
        shapeObj.featureImage = featurePictureUploadResponse?.data[0]?.img
          ? featurePictureUploadResponse?.data[0]?.img
          : null;
      } else if (featurePictureUploadResponse.status == 409) {
        return res.status(409).json({
          status: 409,
          message: featurePictureUploadResponse.message,
          data: null,
        });
      } else {
        return res.status(featurePictureUploadResponse.status || 500).json({
          status: featurePictureUploadResponse.status,
          message: featurePictureUploadResponse.message,
          data: null,
        });
      }
    }

    const newShape = new Shape(shapeObj);

    await newShape
      .save()
      .then((shapeData) => {
        return res.status(200).json({
          status: 200,
          message: "Shape Created successfully",
          data: shapeData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.error("Error creating shape:", error);
    res.status(500).json({ meassge: "Error creating shape" });
  }
};

const getAllShapes = async (req, res) => {
  try {
    const shapes = await Shape.find({}).sort({ _id: -1 });

    return res.status(200).json({
      status: 200,
      message: "Shapes fetched successfully",
      data: shapes,
    });
  } catch (error) {
    console.error("Error fetching shapes:", error);
    res.status(500).json({ meassge: "Error fetching shapes" });
  }
};

module.exports = { createShape, getAllShapes };
