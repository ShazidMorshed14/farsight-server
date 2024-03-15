const slugify = require("slugify");

const Color = require("../models/color");
const { generateUniqueCode, isArrayAndHasContent } = require("../utils/utils");

const createColor = async (req, res) => {
  try {
    const { name, value } = req.body;

    const checkColor = await Color.findOne({
      $or: [
        {
          name: name,
        },
        { value: value },
      ],
    });

    if (checkColor) {
      return res.status(409).json({ message: "Same Color Already Exists!" });
    }

    const colorObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      value: value ? value : "#fff",
      createdBy: req.user._id,
    };

    const newColor = new Color(colorObj);

    await newColor
      .save()
      .then((colorData) => {
        return res.status(200).json({
          status: 200,
          message: "Color Created successfully",
          data: colorData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.error("Error creating color:", error);
    res.status(500).json({ meassge: "Error creating color" });
  }
};

const getAllColors = async (req, res) => {
  try {
    const colors = await Color.find({}).sort({ _id: -1 });

    return res.status(200).json({
      status: 200,
      message: "Colors fetched successfully",
      data: colors,
    });
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ meassge: "Error fetching colors" });
  }
};

module.exports = { createColor, getAllColors };
