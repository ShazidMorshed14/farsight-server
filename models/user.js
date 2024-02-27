const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/aventra/image/upload/v1676883327/default-avatar-png_okjzqd.png",
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "vendor", "user"],
      default: "vendor",
    },
    designation: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    user_weight: {
      type: Number,
      enum: [2, 4, 6, 8, 10],
      default: 2,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
