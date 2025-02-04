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

    // Check if the wallet exists
    let wallet = await Wallet.findOne({ user: userId });

    if (wallet) {
      // Wallet exists, update the amount
      wallet = await Wallet.findOneAndUpdate(
        { user: userId },
        { $inc: { amount: amount } },
        { new: true }
      );
    } else {
      // Wallet does not exist, create a new one
      wallet = new Wallet({
        user: userId,
        amount: amount, // Set initial balance
      });
      await wallet.save();
    }

    return successResponse(res, "Wallet added successfully", wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

