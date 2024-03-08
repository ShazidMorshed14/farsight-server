const User = require("../../models/user");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const slugify = require("slugify");
const {
  generateUniqueCode,
  generateHashedPassword,
  userWeight,
} = require("../../utils/utils");

const model_name = "User";

const signin = async (req, res) => {
  try {
    const { identifier } = req.body;

    let user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        //creating token with userId
        var token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1d",
          }
        );

        user.password = undefined;
        res.cookie("token", token, { expiresIn: "1d" });
        return res.status(200).json({
          status: 200,
          message: "Vendor logged in successfully",
          data: {
            user: user,
            token: token,
          },
        });
      } else {
        return res.status(422).json({ message: "Validation Failed" });
      }
    } else {
      return res
        .status(404)
        .json({ message: "No user with this Email Or Phone" });
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { signin };
