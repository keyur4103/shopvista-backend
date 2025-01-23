const Wallet = require("../models/walletSchema");
const WalletTransaction = require("../models/walletTransaction");
const {
  successResponseWithData,
  successResponse,
  notFoundResponse,
} = require("../utils/apiResponse");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getUserWallet = async (req, res) => {
  try {
    const userId = req.crUser._id;

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return notFoundResponse(res, "No wallet found !!!");
    }
    await wallet.save();

    return successResponseWithData(res, "Wallet data get successfully", wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.walletAdd = async (req, res) => {
  try {
    const { amount } = req.body;
    // Create a PaymentIntent with the amount specified
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.walletAddSuccess = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.crUser._id;

    // Create a wallet transaction record
    const walletTransaction = new WalletTransaction({
      userId: userId,
      type: "deposit",
      amount: amount, 
    });

    // Save the wallet transaction record
    await walletTransaction.save();
    // Update the user's wallet balance with the added amount
    await Wallet.findOneAndUpdate(
      { user: userId },
      { $inc: { amount: amount } },
      { new: true }
    );

    return successResponse(res, "Wallet added successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
