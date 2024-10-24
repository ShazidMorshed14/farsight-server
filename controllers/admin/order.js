const mongoose = require("mongoose");
const slugify = require("slugify");

//importing the category model
const User = require("../../models/user");
const { userWeight, generateUniqueCode } = require("../../utils/utils");
const Product = require("../../models/product");
const Order = require("../../models/order");

const MODEL_NAME = "Orders";

const placeOrder = async (req, res) => {
  const session = await mongoose.startSession(); // Start a session for transaction
  session.startTransaction();

  // Array to hold the previous product quantities for rollback
  let previousQuantities = [];

  try {
    const {
      ordered_products,
      total_bill,
      total_discounted_bill,
      payment_method,
      card_no,
      online_scource_type,
      trx_no,
      delivery_address,
      contact_no,
    } = req.body;

    const currentUser = req.user;
    const userDetails = await User.findById(currentUser?._id);

    if (!userDetails) {
      return res.status(404).json({
        status: 404,
        message: `Issuer couldn't found!`,
        data: null,
      });
    }

    const order_no = `ORD-${generateUniqueCode()}`;
    const receipt_no = `RCPT-${generateUniqueCode()}`;

    // Update the stock of each product variant in a loop
    for (let i = 0; i < ordered_products.length; i++) {
      const { productId, variant, quantity } = ordered_products[i];

      // Find the product by ID
      const product = await Product.findById(productId).session(session);

      if (!product) {
        return res.status(404).json({
          status: 404,
          message: `Product couldn't found!`,
          data: null,
        });
      }

      // Find the variant (color) in the product's colors list
      const colorIndex = product.colors.findIndex(
        (colorItem) => colorItem.color.toString() === variant
      );

      if (colorIndex === -1) {
        return res.status(404).json({
          status: 404,
          message: `Variant (color) with ID ${variant} not found in product ${productId}`,
          data: null,
        });
      }

      // Check if there's enough quantity for the variant
      const selectedColor = product.colors[colorIndex];
      if (selectedColor.color_quantity < quantity) {
        return res.status(404).json({
          status: 404,
          message: `Insufficient stock for variant ${variant} in product ${productId}`,
          data: null,
        });
      }

      // Store previous quantity for rollback
      previousQuantities.push({
        productId,
        variant,
        previousQuantity: selectedColor.color_quantity,
      });

      // Reduce the stock for the variant
      product.colors[colorIndex].color_quantity -= quantity;

      // Save the updated product (with session for transaction)
      await product.save({ session });
    }

    // If all stock updates succeed, proceed to place the order
    const newOrder = new Order({
      order_no: order_no,
      receipt_no: receipt_no,
      user_id: currentUser?._id,
      total_bill: total_bill ?? 0,
      total_discounted_bill: total_discounted_bill ?? 0,
      ordered_products: ordered_products,
      payment_method: payment_method ?? "COD",
      card_no: card_no ?? null,
      online_scource_type: online_scource_type ?? null,
      trx_no: trx_no ?? null,
      order_status: "PENDING",
      delivery_address: delivery_address ?? null,
      contact_no: contact_no ?? null,
    });

    // Save the new order (with session for transaction)
    const savedOrder = await newOrder.save({ session });

    // Commit the transaction if everything goes well
    await session.commitTransaction();

    // Populate the full details of the order (e.g., products, user, etc.)
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("user_id", "name email") // Populating user details
      .populate("ordered_products.productId") // Populating product details in the ordered products
      .populate("ordered_products.variant"); // Populating variant (color) details

    return res.status(200).json({
      status: 200,
      message: "Order created and stocks updated successfully",
      data: populatedOrder,
    });
  } catch (error) {
    // Rollback changes if any failure occurs
    await session.abortTransaction();

    // Revert all stock changes made before the error
    for (const { productId, variant, previousQuantity } of previousQuantities) {
      const product = await Product.findById(productId);
      const colorIndex = product.colors.findIndex(
        (colorItem) => colorItem.color.toString() === variant
      );

      if (colorIndex !== -1) {
        product.colors[colorIndex].color_quantity = previousQuantity;
        await product.save();
      }
    }

    return res.status(400).json({
      status: 400,
      message: error.message ?? "Order creation failed",
    });
  } finally {
    // End the session
    session.endSession();
  }
};

const getOrders = async (req, res) => {
  try {
    let {
      page,
      pageSize,
      pageLess,
      search,
      order_status,
      user_id,
      start_date,
      end_date,
    } = req.query;

    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 10;

    let query = {};
    let totalCount = 0;

    if (search) {
      query.$or = [
        { order_no: { $regex: search, $options: "i" } },
        { receipt_no: { $regex: search, $options: "i" } },
      ];
    }

    if (user_id) {
      query.user_id = user_id;
    }

    if (order_status) {
      query.order_status = order_status;
    }

    // Date range filtering
    if (start_date || end_date) {
      let startDate = start_date ? new Date(start_date) : null;
      let endDate = end_date ? new Date(end_date) : new Date(); // If end_date is not provided, use today's date

      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = startDate; // Filter from start_date
      }

      if (endDate) {
        // Ensure the endDate includes the entire day by setting time to the end of the day
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate; // Filter until end_date
      }
    }

    if (pageLess) {
      // If pageLess is true, return all patients
      const orders = await Order.find(query)
        .populate([
          {
            path: "user_id",
            select: "_id name role email",
          },
          {
            path: "ordered_products.productId",
          },
          {
            path: "ordered_products.variant",
          },
        ])
        .sort({ _id: -1 });
      totalCount = orders.length;

      if (pageLess !== undefined && pageLess === "true") {
        return res.status(200).json({
          status: 200,
          message: "Orders fetched successfully!",
          data: {
            orders: orders,
            total: totalCount,
          },
        });
      }
    } else {
      // If pageLess is false or not provided, apply pagination
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      const paginatedOrders = await Order.find(query)
        .populate([
          {
            path: "user_id",
            select: "_id name role email",
          },
          {
            path: "ordered_products.productId",
          },
          {
            path: "ordered_products.variant",
          },
        ])
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      totalCount = await Order.countDocuments(query);

      return res.status(200).json({
        status: 200,
        message: `${MODEL_NAME} fetched successfully!`,
        data: {
          orders: paginatedOrders,
          total: totalCount,
        },
      });
    }
  } catch (error) {
    console.error(`Error fetching ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error fetching ${MODEL_NAME}` });
  }
};

module.exports = { placeOrder, getOrders };
