const { body, param } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const User = require("../models/userSchema");
// const bcrypt = require("bcrypt");
// const asyncHandler = require("express-async-handler");

exports.createUserValidator = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("role").notEmpty().withMessage("Role is required"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .notEmpty()
    .withMessage("Email is required")
    .custom(async (value) => {
      // Check if the email is already in the database
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email is already registered. Please enter a new one.");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("firstName").optional().notEmpty().withMessage("First name is required"),
  body("lastName").optional().notEmpty().withMessage("Last name is required"),
  body("role").optional().notEmpty().withMessage("Role is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .notEmpty()
    .withMessage("Email is required")
    .custom(async (value) => {
      // Check if the email is already in the database
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email is already registered. Please enter a new one.");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.verifyBlockUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  validatorMiddleware,
];
