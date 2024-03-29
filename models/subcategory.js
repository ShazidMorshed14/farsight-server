const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const SubcategorySchema = new mongoose.Schema(
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
    },
    subCategoryImage: { type: String },
    subCategoryAppImage: { type: String },
    categories: [{ type: ObjectId, ref: "Category" }],
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subcategory", SubcategorySchema);
