const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    otp: { type: Number },
    email: { 
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      default: "uploads/avatar.jpg",
    },
    role: {
      type: String,
      default: "user",
    },
    verified: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: Number,
        city: String,
        postalCode: Number,
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
