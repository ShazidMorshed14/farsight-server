const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      required: true,
    },
    value: { type: String, default: null, required: true },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Color", colorSchema);
