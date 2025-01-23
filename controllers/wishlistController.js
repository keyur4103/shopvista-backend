const WishList = require("../models/wishlistSchema");
const asyncHandler = require("express-async-handler");
const {
  successResponseWithData,
  ErrorResponse,
  //   notFoundResponse,
  successResponse,
} = require("../utils/apiResponse");
const Product = require("../models/productSchema");

// @desc Add product to Wishlist
exports.addProductToWishlist = asyncHandler(async (req, res) => {
  try {
    console.log(
      "🚀 ~ exports.addProductToWishlist=asyncHandler ~ req.body:",
      req.body
    );
    const { productSlug } = req.body;
    console.log(
      "🚀 ~ exports.addProductToWishlist=asyncHandler ~ productId:",
      productSlug
    );
    const userId = req.crUser._id;
    let productId = await Product.findOne({ slug: productSlug });
    console.log("🚀 ~ exports.addProductToWishlist=asyncHandler ~ productId:", productId)

    // Check if user has a wishlist
    let wishlist = await WishList.findOne({ user: userId });
    console.log(
      "🚀 ~ exports.addProductToWishlist=asyncHandler ~ wishlist:",
      wishlist
    );

    // If user doesn't have a wishlist, create a new one
    if (!wishlist) {
      wishlist = new WishList({ user: userId, wishlistItems: [] });
    }

    // Check if the product is already in the wishlist
    const existingItem = wishlist.wishlistItems.find(
      (item) => item?.product?.toString() === productSlug
    );

    if (existingItem) {
      return successResponse(res, "Product already in wishlist");
    }

    // Add the product to the wishlist
    wishlist.wishlistItems.push({
      product: productId,
      expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
    });

    // Save the updated wishlist
    const updatedWishlist = await wishlist.save();

    successResponseWithData(
      res,
      "Product added to wishlist successfully",
      updatedWishlist
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
});

// @desc Remove product from Wishlist
exports.removeProductFromWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.crUser._id;

    // Find user's wishlist
    const wishlist = await WishList.findOne({ user: userId });

    if (!wishlist) {
      return ErrorResponse(res, "Wishlist not found");
    }

    // Use findOneAndUpdate to directly remove the product from the wishlist
    const updatedWishlist = await WishList.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          wishlistItems: { product: productId },
        },
      },
      { new: true }
    );

    if (!updatedWishlist) {
      return ErrorResponse(res, "Product not found in the wishlist", 404);
    }

    // Remove the wishlist item from the array
    wishlist.wishlistItems.splice(updatedWishlist, 1);

    // Save the updated wishlist
    const saveWishlist = await wishlist.save();

    successResponseWithData(
      res,
      "Product removed from wishlist successfully",
      saveWishlist
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
});

// @Desc get Logged User Wishlist
exports.getLoggedUserWishlist = asyncHandler(async (req, res) => {
  const wishlist = await WishList.findOne({ user: req.crUser._id }).populate(
    "wishlistItems.product"
  );

  if (!wishlist) {
    return ErrorResponse(
      res,
      `There is no wishlist for this user id : ${req.crUser._id}`
    );
  }

  // Remove expired wishlist items
  wishlist.wishlistItems = wishlist.wishlistItems.filter(
    (item) => item.expiresAt > new Date()
  );

  // Save the updated wishlist
  const updatedWishlist = await wishlist.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: updatedWishlist.wishlistItems.length,
    data: wishlist,
  });
});
