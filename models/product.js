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
    keyFeatures: {
      type: String,
    },
    specification: {
      type: String,
    },
    inStock: {
      type: Number,
      required: true,
      default: 0,
    },
    hasVariants: {
      type: Boolean,
      required: true,
      default: false,
    },
    colorVariants: [
      {
        variant_code: { type: String, required: true },
        variant_type: {
          type: String,
          enum: ["color", "size", "feature", "other"],
          required: true,
        },
        label: { type: String, required: true },
        value: { type: String, required: true },
        add_amount: { type: Number, required: true, default: 0 },
        variant_quantity: { type: Number, required: true, default: 0 },
      },
    ],
    size_type: {
      type: String,
      default: "US",
    },
    sizeVariants: [
      {
        variant_code: { type: String, required: true },
        variant_type: {
          type: String,
          enum: ["color", "size", "feature", "other"],
          required: true,
        },
        label: { type: String, required: true },
        value: { type: String, required: true },
        add_amount: { type: Number, required: true, default: 0 },
        variant_quantity: { type: Number, required: true, default: 0 },
      },
    ],
    featureVariants: [
      {
        variant_code: { type: String, required: true },
        variant_type: {
          type: String,
          enum: ["color", "size", "feature", "other"],
          required: true,
        },
        label: { type: String, required: true },
        value: { type: String, required: true },
        add_amount: { type: Number, required: true, default: 0 },
        variant_quantity: { type: Number, required: true, default: 0 },
      },
    ],
    otherVariants: [
      {
        variant_code: { type: String, required: true },
        variant_type: {
          type: String,
          enum: ["color", "size", "feature", "other"],
          required: true,
        },
        label: { type: String, required: true },
        value: { type: String, required: true },
        add_amount: { type: Number, required: true, default: 0 },
        variant_quantity: { type: Number, required: true, default: 0 },
      },
    ],
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
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
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
    outSideRegionAllowed: {
      type: Boolean,
      required: true,
      default: false,
    },
    insideDeliveryCharge: {
      type: Number,
      default: 0,
    },
    outsideDeliveryCharge: {
      type: Number,
      default: 0,
    },
    defaultDeliveryCharge: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
