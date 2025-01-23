const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("User", addressSchema);

module.exports = Address;
