const express = require("express");
const router = express.Router();
const {
  registrationValidator,
  loginValidator,
  verifyValidator,
  resendVerifyValidator,
  forgotPassValidator,
  changePassValidator,
  resetPasswordValidation,
} = require("../validations/authValidation");

const {
  signup,
  signin,
  verify,
  resendVerify,
  forgotPass,
  resetPass,
  changePass,
} = require("../controllers/authController");

// Main
const { sendMail } = require("../middlewares/mailSendler");
const { requireLogIn } = require("../middlewares/auth");

// create a new user in db  @access	Public
router.post("/signup", registrationValidator, sendMail, signup);

// authenticate a current user @access	Public
router.post("/login", loginValidator, signin);

// Verify a current user @access  Public
router.post("/verify-otp", verifyValidator, verify);

// Resend OTP for Verify  a current user @access	Public
router.post(
  "/resend-verify-otp",
  resendVerifyValidator,
  sendMail,
  resendVerify
);

// Forgot Password mail send @access  Public
router.post("/forgot-password", forgotPassValidator, forgotPass);

// Reset Password @access  Public
router.post("/reset-password", resetPasswordValidation, resetPass);

// Resend OTP for Verify  a current user @access  Private/User
router.post("/change-password", requireLogIn, changePassValidator, changePass);

module.exports = router;
