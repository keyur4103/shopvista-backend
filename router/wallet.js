const express = require("express");
const { allowedTo, requireLogIn } = require("../middlewares/auth");
const {
  getUserWallet,
  walletAdd,
  walletAddSuccess,
} = require("../controllers/walletController");
const router = express.Router();

// Admin
router.use(requireLogIn);

// @desc Get User wallet @access Private/Admin
router.get("/", allowedTo("admin"), getUserWallet);

router.post("/create-payment-intent", allowedTo("admin"), walletAdd);
router.post("/handle-payment-success", allowedTo("admin"), walletAddSuccess);

module.exports = router;
