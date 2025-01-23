const { body } = require("express-validator");
const User = require("../models/userSchema");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.registrationValidator = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("password").notEmpty().withMessage("Password is required"),
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

exports.loginValidator = [
  // Check if password and email in the body
  body("email")
    .notEmpty()
    .withMessage("email not allowed to be empty")
    .isEmail()
    .withMessage("email must be a valid email")
    .custom(async (email, { req }) => {
      // Check if the user exists in database
      const user = await User.findOne({ email: email });
      if (!user) {
        return Promise.reject(
          new Error(
            "The email address you entered isn't connected to an account"
          )
        );
      }
      req.user = user;
      return true;
    }),

  body("password").notEmpty().withMessage("password not allowed to be empty"),

  validatorMiddleware,
];

exports.verifyValidator = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("otp")
    .isNumeric()
    .withMessage("OTP must be numeric")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),

  validatorMiddleware,
];

exports.resendVerifyValidator = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .notEmpty()
    .withMessage("Email is required"),

  validatorMiddleware,
];

exports.forgotPassValidator = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .notEmpty()
    .withMessage("Email is required"),

  validatorMiddleware,
];

exports.resetPasswordValidation = [
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .isString()
    .withMessage("Token must be a string"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmpassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.changePassValidator = [
  body("oldpassword").notEmpty().withMessage("Old password is required"),
  body("newpassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  body("confirmpassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newpassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  validatorMiddleware,
];
