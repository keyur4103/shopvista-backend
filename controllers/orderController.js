const Order = require("../models/orderSchema");
const Cart = require("../models/cartSchema");
const Stock = require("../models/stockSchema");
const {
  successResponseWithData,
  ErrorResponse,
  successResponse,
} = require("../utils/apiResponse");
const Wallet = require("../models/walletSchema");
const WalletTransaction = require("../models/walletTransaction");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.crUser._id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    successResponseWithData(res, "User orders retrieved successfully", orders);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orders = await Order.find({ orderId: orderId });

    const sessionId = orders[0].sessionId;
    console.log("🚀 ~ exports.getSingleOrder= ~ sessionId:", sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("🚀 ~ exports.getSingleOrder= ~ session:", session.status);

    if (session.status !== "complete") {
      return ErrorResponse(res, "Order not completed");
    }

    // Find the order by orderId
    const orderToUpdate = await Order.findOne({ orderId: orderId });

    // If order not found, return an error
    if (!orderToUpdate) {
      return ErrorResponse(res, "Order not found");
    }

    orderToUpdate.status = session.status;

    // Save the updated order
    const savedOrder = await orderToUpdate.save();

    successResponseWithData(
      res,
      "Order retrieved successfully",
      session.status
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

exports.placeOrder = async (req, res) => {
  try {
    console.log("🚀 ~ exports.placeOrder= ~ req:", req.body);
    const userId = req.crUser._id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId })
      .populate("cartItems.product")
      .populate({ path: "cartItems.color", select: "name" })
      .populate({ path: "cartItems.size", select: "name" });
    console.log("🚀 ~ exports.placeOrder= ~ cart:", cart);

    if (!cart) {
      return ErrorResponse(res, "Cart not found");
    }

    // Create order
    const orderItems = cart?.cartItems?.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      price: item.price,
    }));

    if (req.body.paymentMethodType !== "card") {
      const orderId = generateOrderId();

      // Create a wallet transaction record
      const walletTransaction = new WalletTransaction({
        userId: userId,
        type: "purchase",
        amount: cart.totalCartPrice,
      });

      // Save the wallet transaction record
      await walletTransaction.save();

      const order = new Order({
        user: userId,
        cartItems: orderItems,
        orderId: orderId,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice: cart.totalCartPrice,
        paymentMethodType: req.body.paymentMethodType,
        status: "complete",
      });

      // Update stock quantities
      console.log("🚀 ~ orderItems ~ orderItems:", orderItems);
      await updateStockQuantities(orderItems);

      // Clear user's cart items
      console.log("🚀 ~ exports.placeOrder= ~ userId:", userId);
      await clearCart(userId);

      // If payment method is "wallet", deduct amount from user's wallet
      if (req.body.paymentMethodType === "wallet") {
        const userWallet = await Wallet.findOne({ user: userId });

        if (!userWallet) {
          return ErrorResponse(res, "User's wallet not found");
        }

        // Check if user has sufficient balance
        if (userWallet.amount < cart.totalCartPrice) {
          return ErrorResponse(res, "Insufficient balance in wallet");
        }

        // Deduct amount from user's wallet
        userWallet.amount -= cart.totalCartPrice;
        await userWallet.save();
      }

      // Save the order
      const savedOrder = await order.save();

      successResponseWithData(res, "Order placed successfully", savedOrder);
    } else {
      const orderId = req.body.orderId;
      console.log("🚀 ~ exports.placeOrder= ~ orderId:", orderId);

      // // Find the order by orderId
      // const orderToUpdate = await Order.findOne({ orderId: orderId });

      // // If order not found, return an error
      // if (!orderToUpdate) {
      //   return ErrorResponse(res, "Order not found");
      // }

      // // Update the order properties
      // orderToUpdate.cartItems = orderItems;
      // orderToUpdate.shippingAddress = req.body.shippingAddress;
      // orderToUpdate.totalOrderPrice = cart.totalCartPrice;
      // orderToUpdate.paymentMethodType = req.body.paymentMethodType;

      // // Update stock quantities
      // console.log("🚀 ~ orderItems ~ orderItems:", orderItems);
      // await updateStockQuantities(orderItems);

      // // Clear user's cart items
      // console.log("🚀 ~ exports.placeOrder= ~ userId:", userId);
      // await clearCart(userId);

      // // If payment method is "wallet", deduct amount from user's wallet
      // if (req.body.paymentMethodType === "wallet") {
      //   const userWallet = await Wallet.findOne({ user: userId });

      //   if (!userWallet) {
      //     return ErrorResponse(res, "User's wallet not found");
      //   }

      //   // Check if user has sufficient balance
      //   if (userWallet.amount < cart.totalCartPrice) {
      //     return ErrorResponse(res, "Insufficient balance in wallet");
      //   }

      //   // Deduct amount from user's wallet
      //   userWallet.amount -= cart.totalCartPrice;
      //   await userWallet.save();
      // }

      // // Save the updated order
      // const savedOrder = await orderToUpdate.save();

      // successResponseWithData(res, "Order updated successfully", savedOrder);
    }
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

exports.getAllOrders = async (req, res) => {
  console.log("🚀 ~ exports.getAllOrders= ~ getAllOrders:");
  try {
    const orders = await Order.find({ status: "complete" })
      .populate({ path: "user", select: "firstName , lastName" })
      .populate("cartItems.product")
      .populate({ path: "cartItems.color", select: "name" })
      .populate({ path: "cartItems.size", select: "name" })
      .sort({ createdAt: -1 });

    return successResponseWithData(
      res,
      "All orders retrieved successfully",
      orders
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.crUser._id;
    console.log("🚀 ~ exports.cancelOrder= ~ orderId:", orderId);
    const order = await Order.findOne({ orderId: orderId });
    console.log("🚀 ~ exports.cancelOrder= ~ Order:", order);
    if (!order) {
      return ErrorResponse(res, "Order not found");
    }
    order.status = "cancelled";
    await order.save();

    if (order.paymentMethodType !== "cash") {
      console.log("refund...");
      const userWallet = await Wallet.findOne({ user: order.user });
      if (!userWallet) {
        return ErrorResponse(res, "User's wallet not found");
      }
      // Create a wallet transaction record
      const walletTransaction = new WalletTransaction({
        userId: userId,
        type: "refund",
        amount: order.totalOrderPrice,
      });

      // Save the wallet transaction record
      await walletTransaction.save();
      userWallet.amount += order.totalOrderPrice;
      await userWallet.save();
    }
    successResponse(
      res,
      "Order cancelled successfully & refund credited to your wallet"
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

async function updateStockQuantities(orderItems) {
  console.log("🚀 ~ updateStockQuantities ~ orderItems:", orderItems);
  for (const item of orderItems) {
    // Build the query object dynamically based on the presence of color and size
    let query = { product: item.product };

    // Add color and size to the query if provided
    if (item.color) {
      query.color = item.color;
    }

    if (item.size) {
      query.size = item.size;
    }

    // Find the stock for the given product, color, and size (if provided)
    const stock = await Stock.findOne(query);
    console.log("🚀 ~ updateStockQuantities ~ stock:", stock);

    if (stock) {
      stock.quantity -= item.quantity; // Decrease the stock quantity
      await stock.save(); // Save the updated stock
    } else {
      console.log(
        "🚀 ~ updateStockQuantities ~ No stock found for item:",
        item
      );
    }
  }
}

async function clearCart(userId) {
  console.log("🚀 ~ clearCart ~ userId:", userId);
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.cartItems = [];
    await cart.save();
  }
}

function generateOrderId() {
  // Generate 5 random characters
  const randomChars = Array.from({ length: 5 }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");

  return randomChars;
}
