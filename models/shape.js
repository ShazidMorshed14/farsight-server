const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const shapeSchema = new mongoose.Schema(
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
    featureImage: { type: String, default: null },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shape", shapeSchema);
