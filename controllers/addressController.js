const User = require("../models/userSchema");
const {
  successResponseWithData,
  ErrorResponse,
  //   notFoundResponse,
  //   successResponse,
} = require("../utils/apiResponse");

// @desc  Add address to user addresses list
exports.addAddress = async (req, res) => {
  try {
    const { alias, details, phone, city, postalCode } = req.body;
    const userId = req.crUser._id;
    console.log("🚀 ~ exports.addAddress= ~ userId:", userId);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          addresses: { alias, details, phone, city, postalCode },
        },
      },
      { new: true }
    );

    successResponseWithData(
      res,
      "Address added successfully",
      updatedUser.addresses
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

exports.removeAddress = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🚀 ~ exports.removeAddress= ~ req.params:", req.params)
    const userId = req.crUser._id;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          addresses: { _id: id },
        },
      },
      { new: true }
    );

    successResponseWithData(
      res,
      "Address removed successfully",
      updatedUser.addresses
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { alias, details, phone, city, postalCode } = req.body;
    const userId = req.crUser._id;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": id },
      {
        $set: {
          "addresses.$.alias": alias,
          "addresses.$.details": details,
          "addresses.$.phone": phone,
          "addresses.$.city": city,
          "addresses.$.postalCode": postalCode,
        },
      },
      { new: true }
    );

    successResponseWithData(res, "Address updated successfully", updatedUser.addresses);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};


exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.crUser._id;
    const user = await User.findById(userId);

    if (!user) {
      return ErrorResponse(res, "User not found", 404);
    }

    successResponseWithData(res, "User addresses retrieved successfully", user.addresses);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

