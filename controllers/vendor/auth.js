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

        //check if password reset is required or not

        if (user?.isPassResetReq) {
          return res.status(201).json({
            status: 201,
            message: "Password Reset Required",
            data: user,
          });
        } else {
          res.cookie("token", token, { expiresIn: "1d" });
          return res.status(200).json({
            status: 200,
            message: "Vendor logged in successfully",
            data: {
              user: user,
              token: token,
            },
          });
        }
      } else {
        return res.status(409).json({
          status: 409,
          message: "Validation Failed",
        });
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

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    const { id } = req.params;

    const checkUser = await User.findOne({ _id: id });

    if (!checkUser) {
      return res.status(404).json({ message: "No User Found" });
    }

    if (password !== confirmPassword) {
      return res.status(422).json({ message: "Password didn't match" });
    }

    const userObj = {
      password: generateHashedPassword(password),
      isPassResetReq: false,
    };

    await User.findByIdAndUpdate(id, userObj, { new: true })
      .then((userData) => {
        userData.password = undefined;
        return res.status(200).json({
          status: 200,
          message: "Password Changed Successfully!",
          data: userData,
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

module.exports = { signin, resetPassword };
