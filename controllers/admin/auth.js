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

const getAllAdmins = async (req, res) => {
  try {
    const issuer_weight = req.user.user_weight;
    let { page, pageSize, pageLess, searchkey, phone, email, role } = req.query;

    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 10;

    let query = {};
    let totalCount = 0;

    if (issuer_weight) {
      query.user_weight = { $lt: issuer_weight };
    }

    query.role = { $ne: "customer" };

    if (role) {
      query.role = role;
    }

    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    if (phone) {
      if (phone.startsWith("+")) {
        phone = phone.substring(1); // Remove the leading "+"
      }
      query.phone = { $regex: phone, $options: "i" };
    }

    if (searchkey) {
      query.name = { $regex: searchkey, $options: "i" };
      query.username = { $regex: searchkey, $options: "i" };
    }

    if (pageLess) {
      // If pageLess is true, return all patients
      const users = await User.find(query).select(
        "_id name username email phone image role status createdAt updatedAt"
      );
      totalCount = users.length;

      if (pageLess !== undefined && pageLess === "true") {
        return res.status(200).json({
          status: 200,
          message: "Admins fetched successfully!",
          data: {
            users: users,
            total: totalCount,
          },
        });
      }
    } else {
      // If pageLess is false or not provided, apply pagination
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      const paginatedAdmins = await User.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "_id name username email phone image role status createdAt updatedAt"
        );

      totalCount = await User.countDocuments(query);

      return res.status(200).json({
        status: 200,
        message: `${model_name} fetched successfully!`,
        data: {
          users: paginatedAdmins,
          total: totalCount,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Error fetching admins" });
  }
};

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      image,
      password,
      role,
      designation,
      isPassResetReq,
    } = req.body;

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
            role: role ? role : "admin",
            status: "active",
            user_weight: userWeight[role] ? userWeight[role] : 2,
            designation: designation ? designation : null,
            isPassResetReq: isPassResetReq ? isPassResetReq : true,
          });

          user
            .save()
            .then((userData) => {
              return res.status(200).json({
                status: 200,
                message: "Admin Registered successfully",
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

module.exports = { signup, signin, getAllAdmins };
