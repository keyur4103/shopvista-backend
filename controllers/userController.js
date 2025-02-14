const User = require("../models/userSchema");
const {
  successResponseWithData,
  notFoundResponse,
  successResponse,
} = require("../utils/apiResponse");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const walletModel = require("../models/walletSchema");
const Wallet = require("../models/walletSchema");
// const ApiError = require("../utils/APIError");

// @desc  Get all users
// @access Private/Admin
exports.getallusers = async (req, res) => {
  try {
    const users = await User.find().exec();

    res.status(200).json({
      results: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// @desc Create a user
// @access Private/Admin
exports.createUser = async (req, res) => {
  const salt = await bcrypt.genSalt();
  let password = await bcrypt.hash(`${req.body.password}`, salt);
  User.create({ ...req.body, password })
    .then(async (user) => {
      if (user) {
        const wallet = await Wallet.create({ user: user._id });
        successResponseWithData(res, "User created successfully", user);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

//  @desc update user
//  @access Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  try {
    console.log("🚀 ~ exports.updateUser=asyncHandler ~ req:", req.params.id);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        // email: req.body.email,
        role: req.body.role,
      },
      {
        new: true,
      }
    );
    console.log("🚀 ~ exports.updateUser=asyncHandler ~ user:", user);
    if (!user) {
      console.log("error in update");
      return notFoundResponse(res, `No user for this id ${req.params.id}`);
    }
    successResponseWithData(res, "User updated successfully", user);
  } catch (error) {
    console.log("🚀 ~ exports.updateUser=asyncHandler ~ error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

// @desc Delete a user
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const document = await User.findByIdAndDelete(id);

  if (!document) {
    return notFoundResponse(res, `No document for this id ${id}`);
  }

  successResponse(res, "User Deleted successfully");
});

// @desc Vefify a user
// @access Private/Admin
exports.verifyUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    id,
    { verified: true },
    { new: true }
  );

  if (!user) {
    return notFoundResponse(res, `No user found for this id: ${id}`);
  }

  successResponseWithData(res, "User verified successfully", user);
});

// @desc Block user by ID
// @access Private/Admin
exports.blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return notFoundResponse(res, `No user found for this id: ${id}`);
  }

  // Toggle block status
  user.block = !user.block;
  await user.save();

  successResponseWithData(
    res,
    `User ${user.block ? "blocked" : "unblocked"} successfully`,
    user
  );
});

// @desc get logged in user
// @access Private/Admin
exports.getLoggedInUser = asyncHandler(async (req, res) => {
  const userId = req.crUser._id;
  const user = await User.findById(userId);
  if (!user) {
    notFoundResponse(res, "User not found");
  }
  successResponseWithData(res, "User fetched successfully", user);
});

// @desc update logged in user
// @access Private/Admin
exports.updateUserDetails = asyncHandler(async (req, res) => {
  const userId = req.crUser._id;

  // Extract fields to update from request body
  const { firstName, lastName } = req.body;

  try {
    // Find user by ID
    let user = await User.findById(userId);

    if (!user) {
      return notFoundResponse(res, `User not found with id: ${userId}`);
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    // user.image = image;

    // Save the updated user
    user = await user.save();

    // Return success response
    successResponseWithData(res, "User details updated successfully", user);
  } catch (error) {
    // Handle errors
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});
