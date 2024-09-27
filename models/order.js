const mongoose = require("mongoose");
const { generateUniqueCode } = require("../utils/utils");
const { ObjectId } = mongoose.Schema.Types;

const orderSchema = new mongoose.Schema(
  {
    order_no: {
      type: String,
      required: true,
      unique: true,
    },
    receipt_no: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    total_bill: {
      type: Number,
      required: true,
      default: 0,
    },
    total_discounted_bill: {
      type: Number,
      required: true,
      default: 0,
    },
    delivery_address: {
      type: String,
    },
    ordered_products: [
      {
        quantity: { type: Number, default: 0 },
        variant: { type: ObjectId, ref: "Color", required: true },
        product_unit_price: { type: Number, default: 0, required: true },
        product_discount: { type: Number, default: 0 },
        product_total_price: { type: Number, default: 0, required: true },
        product_discounted_price: { type: Number, default: 0, required: true },
        productId: { type: ObjectId, ref: "Product", required: true },
      },
    ],
    payment_method: {
      type: String,
      required: true,
      enum: ["COD", "ONLINE", "CARD"],
      default: "COD",
    },
    card_no: {
      type: String,
      default: null,
    },
    online_scource_type: {
      type: String,
      enum: ["BKASH", "NAGAD", "ROCKET", null],
      default: null,
    },
    trx_no: {
      type: String,
    },
    order_status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
