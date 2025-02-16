const express = require("express");
const { allowedTo, requireLogIn } = require("../middlewares/auth");
const {
  getWalletTransactions,
} = require("../controllers/WalletTransactionController");
const router = express.Router();

// Admin
router.use(requireLogIn);

router.get(
  "/",
  // addProductValidation,
  getWalletTransactions
);

module.exports = router;
