const express = require("express");
const { allowedTo, requireLogIn } = require("../middlewares/auth");
const {
  getUserWallet,
  walletAdd,
  walletAddSuccess,
} = require("../controllers/walletController");
const router = express.Router();

router.use(requireLogIn);

router.get("/", allowedTo("user"), getUserWallet);

router.post("/create-payment-intent", allowedTo("user"), walletAdd);
router.post("/handle-payment-success", allowedTo("user"), walletAddSuccess);

module.exports = router;
