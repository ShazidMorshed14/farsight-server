const User = require("../models/user");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const slugify = require("slugify");
const {
  generateUniqueCode,
  generateHashedPassword,
} = require("../utils/utils");

const signup = async (req, res) => {
  try {
    const { name, email, phone, image, password } = req.body;

    await User.findOne({
      $or: [{ email: req.body.email, phone: req.body.phone }],
    })
      .then((user) => {
        if (user) {
          return res
            .status(409)
            .json({ message: "Email Or Phone Already exists" });
        } else {
          const user = new User({
            name: name,
            username: `${slugify(name)}-${generateUniqueCode()}`,
            email: email,
            phone: phone,
            image: image
              ? image
              : "https://res.cloudinary.com/aventra/image/upload/v1676883327/default-avatar-png_okjzqd.png",
            password: generateHashedPassword(password),
            role: "customer",
            status: "active",
            user_weight: 2,
          });

          user
            .save()
            .then((userData) => {
              return res.status(200).json({
                status: 200,
                message: "User Registered successfully",
                data: userData,
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(422).json({ message: err });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (err) {
    console.log(err);
    return res.status(422).json({ message: err });
  }
};

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
          message: "User logged in successfully",
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

module.exports = { signup, signin };
