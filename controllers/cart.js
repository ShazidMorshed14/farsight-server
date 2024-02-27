const slugify = require("slugify");

//importing the category model
const Cart = require("../models/cart");

const MODEL_NAME = "Cart";

function runUpdate(condition, update) {
  return new Promise((resolve, reject) => {
    Cart.findOneAndUpdate(condition, update, { upsertA: true })
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
}

const addToCart = async (req, res) => {
  try {
    const alreadyHaveCart = await Cart.findOne({ user: req.user._id });

    if (alreadyHaveCart) {
      //if cart already exists we have to update the existing user cart
      let promiseArray = [];

      req.body.cartItems.forEach((cartItem) => {
        const product = cartItem.product;
        const item = alreadyHaveCart.cartItems.find(
          (c) => c.product == product
        );
        let condition, update;

        if (item) {
          condition = { user: req.user._id, "cartItems.product": product };

          update = {
            $set: {
              "cartItems.$": cartItem,
            },
          };
        } else {
          condition = { user: req.user._id };

          update = {
            $push: {
              cartItems: cartItem,
            },
          };
        }

        promiseArray.push(runUpdate(condition, update));
      });
    } else {
      //if cart doesn't exists it will add directly

      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });

      cart
        .save()
        .then((cartData) => {
          return res.status(200).json({
            status: 200,
            message: "Added to cart successfully",
            data: cartData,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(422).json({ message: err });
        });
    }
  } catch (error) {
    console.error(`Error adding to ${MODEL_NAME}:`, error);
    return res.status(500).json({ meassge: `Error adding ${MODEL_NAME}` });
  }
};

const getCartItems = async (req, res) => {
  try {
    return res.status(200).json({
      status: 200,
      message: "Cart Items fetched successfully!",
      data: [],
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getCartItems, addToCart };
