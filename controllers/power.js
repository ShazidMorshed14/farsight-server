const slugify = require("slugify");

const Power = require("../models/power");
const { generateUniqueCode, isArrayAndHasContent } = require("../utils/utils");

const createPower = async (req, res) => {
  try {
    const { name } = req.body;

    const checkPower = await Power.findOne({
      name: req.body.name,
    });

    if (checkPower) {
      return res.status(409).json({ message: "Same Power Already Exists!" });
    }

    const powObj = {
      name: name,
      slug: `${slugify(name)}-${generateUniqueCode()}`,
      createdBy: req.user._id,
    };

    const newPower = new Power(powObj);

    await newPower
      .save()
      .then((powerData) => {
        return res.status(200).json({
          status: 200,
          message: "Power Created successfully",
          data: powerData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.error("Error creating power:", error);
    res.status(500).json({ meassge: "Error creating power" });
  }
};

const getAllPowers = async (req, res) => {
  try {
    const powers = await Power.find({}).sort({ _id: -1 });

    return res.status(200).json({
      status: 200,
      message: "Powers fetched successfully",
      data: powers,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ meassge: "Error fetching categories" });
  }
};

module.exports = { createPower, getAllPowers };
