const slugify = require("slugify");

const Brand = require("../models/brand");
const { generateUniqueCode, isArrayAndHasContent } = require("../utils/utils");

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    const checkBrand = await Brand.findOne({
      $or: [
        {
          name: name,
        },
      ],
    });

    if (checkBrand) {
      return res.status(409).json({ message: "Same Brand Already Exists!" });
    }

    const brandObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      createdBy: req.user._id,
    };

    const newBrand = new Brand(brandObj);

    await newBrand
      .save()
      .then((brandData) => {
        return res.status(200).json({
          status: 200,
          message: "Brand Created successfully",
          data: brandData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ meassge: "Error creating brand" });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ _id: -1 });

    return res.status(200).json({
      status: 200,
      message: "Brands fetched successfully",
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ meassge: "Error fetching brand" });
  }
};

module.exports = { createBrand, getAllBrands };
