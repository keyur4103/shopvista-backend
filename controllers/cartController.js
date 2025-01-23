const Product = require("../models/productSchema");
const Cart = require("../models/cartSchema");
const WishList = require("../models/wishlistSchema");
const Order = require("../models/orderSchema");
const asyncHandler = require("express-async-handler");
const {
  successResponseWithData,
  ErrorResponse,
  //   notFoundResponse,
  //   successResponse,
} = require("../utils/apiResponse");
const Stock = require("../models/stockSchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const uuid = require("uuid");

// @desc Add product to cart
exports.addProductToCart = asyncHandler(async (req, res) => {
  try {
    const { productId, colorId, sizeId } = req.body;
    const userId = req.crUser._id;
    console.log("🚀 ~ exports.addProductToCart=asyncHandler ~ userId:", userId);

    // Check if the product is available in stock with the specified color and size
    const stockItem = await Stock.findOne({
      product: productId,
      color: colorId,
      size: sizeId,
      quantity: { $gt: 0 },
    });

    if (!stockItem) {
      return ErrorResponse(res, "Product is Out Of Stock 🔴");
    }

    // Check if user has a cart
    let cart = await Cart.findOne({ user: userId });

    // If user doesn't have a cart, create a new one
    if (!cart) {
      cart = new Cart({ user: userId, cartItems: [] });
    }

    // Check if the product is in the wishlist and remove it
    await WishList.findOneAndUpdate(
      { user: userId },
      { $pull: { wishlistItems: { product: productId } } }
    );

    // Check if the product is already in the cart
    const existingCartItemIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color.toString() === colorId &&
        item.size.toString() === sizeId
    );

    if (existingCartItemIndex !== -1) {
      // If the product is already in the cart, update the quantity
      cart.cartItems[existingCartItemIndex].quantity += 1;
    } else {
      // If the product is not in the cart, add a new cart item
      const product = await Product.findById(productId);

      if (!product) {
        return ErrorResponse(res, "Product not found");
      }

      const newCartItem = {
        product: productId,
        color: colorId,
        size: sizeId,
        price: product.price,
      };

      cart.cartItems.push(newCartItem);
    }

    // Update totalCartPrice and totalPriceAfterDiscount
    cart.totalCartPrice = calculateTotalCartPrice(cart.cartItems);

    // Save the updated cart
    const updatedCart = await cart.save();

    successResponseWithData(
      res,
      "Product added to cart successfully",
      updatedCart
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
});

// Remove specific product from cart
exports.removeProductFromCart = async (req, res) => {
  try {
    const { productId, colorId, sizeId } = req.params;
    const userId = req.crUser._id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return ErrorResponse(res, "Cart not found");
    }

    // Update user's cart using the $pull operator to remove the specified item
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          cartItems: {
            product: productId,
            color: colorId,
            size: sizeId,
          },
        },
      },
      { new: true }
    );

    if (!updatedCart) {
      return ErrorResponse(res, "Cart not found");
    }

    // Update totalCartPrice and totalPriceAfterDiscount
    updatedCart.totalCartPrice = calculateTotalCartPrice(updatedCart.cartItems);

    // Save the updated cart
    const savedCart = await updatedCart.save();

    successResponseWithData(
      res,
      "Product removed from cart successfully",
      savedCart
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @Desc get Logged User Cart
exports.getLoggedUserCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.crUser._id })
    .populate("cartItems.product")
    .populate({ path: "cartItems.color", select: "name" })
    .populate({ path: "cartItems.size", select: "name" });
  console.log("🚀 ~ exports.getLoggedUserCart=asyncHandler ~ cart:", cart);

  if (!cart) {
    return ErrorResponse(
      res,
      `There is no cart for this user id : ${req.crUser._id}`
    );
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @Desc Update specific cart item quantity
exports.updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.crUser._id });

  if (!cart) {
    return ErrorResponse(res, `there is no cart for user ${req.crUser._id}`);
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  console.log(
    "🚀 ~ exports.updateCartItemQuantity=asyncHandler ~ itemIndex:",
    cart?.cartItems[itemIndex]
  );

  const item = cart?.cartItems[itemIndex];
  console.log("🚀 ~ exports.updateCartItemQuantity=asyncHandler ~ item:", item);

  // Check if the product is available in stock with the specified color and size
  const stockItem = await Stock.findOne({
    product: item?.product,
    color: item?.color,
    size: item?.size,
    // quantity: { $gt: item?.quantity },
  });
  console.log(
    "🚀 ~ exports.updateCartItemQuantity=asyncHandler ~ stockItem:",
    stockItem
  );

  console.log(
    "🚀 ~ exports.updateCartItemQuantity=asyncHandler ~ stockItem?.quantity:",
    stockItem?.quantity
  );
  console.log(
    "🚀 ~ exports.updateCartItemQuantity=asyncHandler ~ item.quantity:",
    item.quantity
  );
  console.log(
    "🚀 ~ exports.updateCartItemQuantity=asyncHandler ~ stockItem?.quantity < item.quantity:",
    stockItem?.quantity < item.quantity
  );
  if (stockItem?.quantity < quantity) {
    return ErrorResponse(
      res,
      `Only ${+stockItem?.quantity} Product Remaining in Stock 🔴`
    );
  }

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return ErrorResponse(
      res,
      `there is no item for this id :${req.params.itemId}`
    );
  }

  let totalPrice = calculateTotalCartPrice(cart.cartItems);

  cart.totalCartPrice = totalPrice;

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @Desc Clear cart quantity
exports.clearCart = async (req, res) => {
  try {
    const userId = req.crUser._id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return ErrorResponse(res, "Cart not found", 404);
    }

    // Clear cart items
    cart.cartItems = [];

    // Update totalCartPrice and totalPriceAfterDiscount
    cart.totalCartPrice = 0;

    // Save the updated cart
    const updatedCart = await cart.save();

    successResponseWithData(res, "Cart cleared successfully", updatedCart);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

exports.getCheckout = async (req, res) => {
  const userId = req.crUser._id;
  console.log("🚀 ~ exports.getCheckout= ~ userId:", userId);

  const cart = await Cart.findOne({ user: userId })
    .populate("cartItems.product")
    .populate({ path: "cartItems.color", select: "name" })
    .populate({ path: "cartItems.size", select: "name" });
  console.log("🚀 ~ exports.getCheckout= ~ cart:", cart);

  const lineItems = await cart?.cartItems?.map((item) => {
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: item?.product?.name,
        },
        unit_amount: item?.product?.price * 100,
      },
      quantity: item?.quantity,
    };
  });
  console.log("🚀 ~ lineItems ~ lineItems:", lineItems);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
  });

  console.log("🚀 ~ exports.getCheckout= ~ session.id:", session.id);
  const orderId = generateOrderId();

  console.log("🚀 ~ exports.getCheckout= ~ req.body:", req.body);
  const payMethod = req.body.paymentMethodType;

  // Create order
  const orderItems = cart?.cartItems?.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    color: item.color,
    size: item.size,
    price: item.price,
  }));  

  const order = await new Order({
    user: userId,
    cartItems: orderItems,
    orderId: orderId,
    shippingAddress: req.body.address,
    totalOrderPrice: cart.totalCartPrice,
    paymentMethodType: req.body.paymentMethodType,
    status: "pending",
    sessionId: session.id,
  });

  console.log("🚀 ~ exports.getCheckout= ~ order:", order);
  await order.save();

  res.json({ id: session.id, data: cart, orderId });
};

// Helper function to calculate total cart price
function calculateTotalCartPrice(cartItems) {
  return cartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
}

function generateOrderId() {
  // Generate 5 random characters
  const randomChars = Array.from({ length: 7 }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");

  return randomChars;
}
