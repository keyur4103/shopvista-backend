const WalletTransaction = require("../models/walletTransaction");

exports.getWalletTransactions = async (req, res) => {
  try {
    console.log(
      "🚀 ~ exports.getWalletTransactions ~ req.crUser._id:",
      req.crUser._id
    );
    const transactions = await WalletTransaction.find({
      userId: req.crUser._id,
    })
      .populate("userId")
      .sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
