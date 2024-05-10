const slugify = require("slugify");

//importing the category model
const User = require("../../models/user");
const { userWeight } = require("../../utils/utils");

const MODEL_NAME = "Users";

const getVendorDetails = async (req, res) => {
  try {
    const currentUser = req.user;
    console.log(currentUser);

    const userDetails = await User.findById(currentUser?._id);

    if (userDetails) {
      return res.status(200).json({
        status: 200,
        message: `${MODEL_NAME} fetched successfully!`,
        data: userDetails,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: `${MODEL_NAME} Couldn't found!`,
        data: null,
      });
    }
  } catch (error) {
    console.error(`Error fetching ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error fetching ${MODEL_NAME}` });
  }
};

module.exports = { getVendorDetails };
