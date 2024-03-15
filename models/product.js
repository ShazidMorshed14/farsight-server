const mongoose = require("mongoose");
const { generateUniqueCode } = require("../utils/utils");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema(
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
    sku: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    shape: {
      type: ObjectId,
      ref: "Shape",
      required: true,
    },
    colors: [
      {
        add_amount: { type: Number, default: 0 },
        color_details: {
          type: ObjectId,
          ref: "Color",
        },
        color_quantity: { type: Number, default: 0 },
      },
    ],
    supportedPowers: [
      {
        add_amount: { type: Number, default: 0 },
        shape_details: {
          type: ObjectId,
          ref: "Power",
        },
      },
    ],
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    promo_code: {
      type: String,
    },
    productPictures: [
      {
        _id: { type: String },
        img: { type: String },
        default: { type: Boolean, default: false },
      },
    ],
    reviews: [
      {
        userId: { type: ObjectId, ref: "User" },
        review: String,
      },
    ],
    categories: [
      {
        type: ObjectId,
        ref: "Category",
      },
    ],
    subCategories: [
      {
        type: ObjectId,
        ref: "Subcategory",
      },
    ],
    offer_type: {
      type: String,
      required: true,
      enum: ["default", "free_delivery", "on_sale"],
      default: "default",
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
