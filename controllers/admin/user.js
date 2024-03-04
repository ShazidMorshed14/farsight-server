const slugify = require("slugify");

//importing the category model
const User = require("../../models/user");
const { userWeight } = require("../../utils/utils");

const MODEL_NAME = "Users";

const getAllUsers = async (req, res) => {
  try {
    let { searchKey, role, status, pageLess, page, pageSize } = req.query;

    const currentUser = req.user;

    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 10;

    let query = {};
    let totalCount = 0;

    // Add condition to filter users by user_weight
    if (currentUser && currentUser?.user_weight) {
      query.user_weight = { $lt: currentUser.user_weight };
    }

    if (searchKey) {
      query.$or = [
        { name: { $regex: searchKey, $options: "i" } },
        { username: { $regex: searchKey, $options: "i" } },
        { email: { $regex: searchKey, $options: "i" } },
        { phone: { $regex: searchKey, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (role) {
      query.role = role;
    }

    if (pageLess) {
      // If pageLess is true, return all patients
      const users = await User.find(query).sort({ _id: -1 });
      totalCount = users.length;

      if (pageLess !== undefined && pageLess === "true") {
        return res.status(200).json({
          status: 200,
          message: `${MODEL_NAME} fetched successfully!`,
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

      const paginatedUsers = await User.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      totalCount = await User.countDocuments(query);

      return res.status(200).json({
        status: 200,
        message: `${MODEL_NAME} fetched successfully!`,
        data: {
          users: paginatedUsers,
          total: totalCount,
        },
      });
    }
  } catch (error) {
    console.error(`Error fetching ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error fetching ${MODEL_NAME}` });
  }
};

const editUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { role, email, phone } = req.body;

    let reqObj = {
      ...req.body,
    };

    const checkUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (checkUser) {
      return res.status(422).json({
        status: 422,
        message: "User already exists with this email or phone",
        data: userData,
      });
    }

    if (role) {
      reqObj.user_weight = userWeight[role] ? userWeight[role] : 2;
    }

    await User.findByIdAndUpdate(id, reqObj, { new: true })
      .then((userData) => {
        return res.status(200).json({
          status: 200,
          message: "User Updated successfully",
          data: userData,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(422).json({ message: err });
      });
  } catch (error) {
    console.error(`Error fetching ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error fetching ${MODEL_NAME}` });
  }
};

module.exports = { getAllUsers, editUserDetails };
