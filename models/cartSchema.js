const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: {
          type: mongoose.Schema.ObjectId,
          ref: "Color",
        },
        size: {
          type: mongoose.Schema.ObjectId,
          ref: "Size",
        },
        price: Number,
      },
    ],
    totalCartPrice: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Create model
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
