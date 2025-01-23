const mongoose = require("mongoose");

//Sub Schema
const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
      },
    },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    wishlistItems: [wishlistItemSchema],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Create model
const WishList = mongoose.model("WishList", wishlistSchema);
module.exports = WishList;
