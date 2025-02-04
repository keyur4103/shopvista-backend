const express = require("express");
const { requireLogIn, allowedTo } = require("../middlewares/auth");
const {
  addProductToCart,
  removeProductFromCart,
  getLoggedUserCart,
  updateCartItemQuantity,
  clearCart,
  getCheckout,
} = require("../controllers/cartController");
const router = express.Router();

// @desc Create Cart If user dont have OR add Product Into cart @access Private/User
router.post(
  "/",
  requireLogIn,
  // addProductValidation,
  addProductToCart
);

// @desc Create Cart If user dont have OR add Product Into cart @access Private/User
router.delete(
  "/remove/:productId/:colorId/:sizeId",
  requireLogIn,
  // addProductValidation,
  removeProductFromCart
);

//  @desc get Logged User Cart Private/User
router.get("/", [requireLogIn], getLoggedUserCart);

// @Desc Update Cart Item Quantity Private/User
router.put(
  "/:itemId/",
  [requireLogIn, allowedTo("user")],
  // updateCartValidator,
  updateCartItemQuantity
);

// @Desc Clear Cart Private/User
router.delete(
  "/",
  [requireLogIn, allowedTo("user")],
  // updateCartValidator,
  clearCart
);

router.post("/create-checkout-session", requireLogIn, getCheckout);

module.exports = router;
