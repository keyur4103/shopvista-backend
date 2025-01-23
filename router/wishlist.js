const express = require("express");
const { requireLogIn, allowedTo } = require("../middlewares/auth");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../controllers/wishlistController");
const router = express.Router();

// @desc Create Wishlist If user dont have OR add Product Into wishlist @access Private/User
router.post(
  "/",
  [requireLogIn, allowedTo("admin")],
  // addProductValidation,
  addProductToWishlist
);

// @desc Remove Product From wishlist @access Private/User
router.delete(
  "/:id",
  [requireLogIn, allowedTo("admin")],
  // addProductValidation,
  removeProductFromWishlist
);

//  @desc get Logged User Cart Private/User
router.get("/", [requireLogIn], getLoggedUserWishlist);

module.exports = router;
