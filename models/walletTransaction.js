const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "purchase", "refund"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  WalletTransactionSchema
);

module.exports = WalletTransaction;
