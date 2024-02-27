const slugify = require("slugify");

//importing the category model
const User = require("../../models/user");

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

module.exports = { getAllUsers };
