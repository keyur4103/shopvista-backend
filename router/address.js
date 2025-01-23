const express = require("express");
const router = express.Router();

const {
  addAddress,
  removeAddress,
  getUserAddresses,
  updateAddress,
} = require("../controllers/addressController");

const { requireLogIn, allowedTo } = require("../middlewares/auth");

// @desc  Add address to user addresses list
router.post("/", [requireLogIn, allowedTo("admin")], addAddress);

// @desc  Remove address from user addresses list
router.post("/:id", [requireLogIn, allowedTo("admin")], updateAddress);

// @desc  Remove address from user addresses list
router.delete("/:id", [requireLogIn, allowedTo("admin")], removeAddress);

// / @desc  Get logged user addresses list
router.get("/", [requireLogIn, allowedTo("admin")], getUserAddresses);

module.exports = router;
