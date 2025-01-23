const User = require("../models/userSchema");
const Token = require("../models/tokenSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../middlewares/resetPassMailSendler");
const crypto = require("crypto");

require("dotenv").config(); // access environment variables

// @desc  create a new user in db (sign up)
// @access Public
exports.signup = async (req, res) => {
  console.log("🚀 ~ req:", req.body.password);
  let otp = req.otp;
  const salt = await bcrypt.genSalt();
  let password = await bcrypt.hash(`${req.body.password}`, salt);
  console.log("🚀 ~ exports.signup= ~ password:", password);
  // Create User
  User.create({ ...req.body, otp, password })
    .then((user) => {
      if (user) {
        res.status(201).json({
          status: "success",
          message:
            "User registered successfully. Check your email for OTP verification.",
          data: user,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// @desc  authenticate user credentials (sign in)
// @access Public
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  console.log("🚀 ~ exports.signin= ~ user:", user);

  bcrypt.compare(password, user.password);

  // Check User is Verified or Not
  if (!user.verified) {
    return res.status(401).json({ message: "Please verify your email first" });
  }

  // Check User is Blocked
  if (user.block) {
    return res.status(401).json({ message: "Sorry!!, You are Blocked" });
  }

  // compare Hash Password
  if (user && !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ message: "The password that you've entered is incorrect" });
  }

  // Create Token and send it to the Browser
  const token = createToken({
    id: req.user._id,
    role: req.user.role,
  });
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

  // Delete password from response
  delete req.user._doc.password;

  // send response to client side
  res.status(200).json({
    token: token,
    user: req.user,
  });
};

// @desc  Verify OTP (User Verification)
// @access Public
exports.verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    console.log("🚀 ~ exports.verify= ~ user:", user);

    if (user.verified) {
      // User is already verified, send an error response
      return res.status(401).json({ message: "User already verified" });
    }

    if (!user) {
      console.log("🚀 ~ exports.verify= ~ user:", user);
      // If no user is found with the provided email and OTP, send an error response
      return res.status(400).json({ error: "Invalid email" });
    }

    // Check if the user's OTP matches the provided OTP
    console.log("🚀 ~ exports.verify= ~ otp:", typeof otp);
    if (user.otp !== +otp) {
      // If OTP does not match, send an error response
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Update the user's verification status and remove the OTP
    user.verified = true;
    user.otp = undefined; // Remove the OTP from the user document
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc  Verify OTP (User Verification)
// @access Public
exports.resendVerify = async (req, res) => {
  try {
    let otp = req.otp;
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      // If no user is found with the provided email, send an error response
      return res.status(400).json({ error: "Invalid email" });
    }

    // Update the user's OTP in the database
    user.otp = otp;
    await user.save();

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc Forgot Password
// @access Public
exports.forgotPass = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .send({ error: "user with given email doesn't exist" });

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.BASE_URL}/reset-password?token=${token.token}`;
    await sendEmail(user.email, "Password reset", link);

    res
      .status(200)
      .send({ message: "password reset link sent to your email account" });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

// @desc Reset Password
// @access Public
exports.resetPass = async (req, res) => {
  try {
    console.log("🚀 ~ exports.resetPass= ~ req.body:", req.body);
    const token = await Token.findOne({
      token: req.body.token,
    });
    console.log("🚀 ~ exports.resetPass= ~ token:", token);
    if (!token) return res.status(400).send("Invalid link or expired");

    const salt = await bcrypt.genSalt();
    let password = await bcrypt.hash(`${req.body.password}`, salt);

    const user = await User.findByIdAndUpdate(
      {
        _id: token.userId,
      },
      { password: password }
    );

    // user.password = req.body.password;
    await user.save();
    await token.deleteOne();

    res.status(200).send({ success: "password reset sucessfully." });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

// @desc Change Password
// @access Private/User
exports.changePass = async (req, res) => {
  try {
    const user = req.crUser;
    console.log("🚀 ~ exports.changePass= ~ user.password:", user.password);
    const { oldpassword, newpassword } = req.body;

    // Check if the old password matches the stored password
    const isPasswordValid = await bcrypt.compare(oldpassword, user.password);
    console.log("🚀 ~ exports.changePass= ~ isPasswordValid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash the new password before updating
    const hashedNewPassword = await bcrypt.hash(newpassword, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

// @desc create json web token
// Signing a token with 1 Days of expiration:
const maxAge = 1 * 24 * 60 * 60;
const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};
