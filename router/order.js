const express = require("express");
const router = express.Router();
const { requireLogIn, allowedTo } = require("../middlewares/auth");
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getSingleOrder,
  cancelOrder,
} = require("../controllers/orderController");

// Admin
router.use(requireLogIn);

// @desc Get All Orders @access Private/Admin
router.get("/all", allowedTo("admin"), getAllOrders);

// @desc Place Oerder @access Private/Admin
router.post("/", allowedTo("admin"), placeOrder);

router.get("/:orderId", allowedTo("admin"), getSingleOrder);

// @desc Get Logged in user Order @access Private/Admin
router.get("/", allowedTo("admin"), getUserOrders);

// cancel order by orderId
router.post("/:orderId", allowedTo("admin"), cancelOrder);



module.exports = router;
