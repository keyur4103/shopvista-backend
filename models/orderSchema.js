const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    orderId: {
      type: String,
      // required: true
    },
    sessionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "failed", "complete", "cancelled"],
      default: "pending",
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        color: {
          type: mongoose.Schema.ObjectId,
          ref: "Color",
        },
        size: {
          type: mongoose.Schema.ObjectId,
          ref: "Size",
        },
        quantity: Number,
        price: Number,
      },
    ],
    shippingAddress: {
      alias: String,
      details: String,
      phone: Number,
      city: String,
      postalCode: Number,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ["wallet", "cash", "card"],
      default: "cash",
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);
module.exports = orderModel;
