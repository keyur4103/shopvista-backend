const express = require("express");
const router = express.Router();
const { requireLogIn, allowedTo } = require("../middlewares/auth");
const {
  getallusers,
  createUser,
  updateUser,
  deleteUser,
  verifyUser,
  blockUser,
  getLoggedInUser,
  updateUserDetails,
} = require("../controllers/userController");
const {
  createUserValidator,
  updateUserValidator,
  verifyBlockUserValidator,
} = require("../validations/userValidation");

// Admin
router.use(requireLogIn);

// @desc Get all users @access Private/Admin
router.get("/", allowedTo("admin"), getallusers);

// @desc Create user @access Private/Admin
router.post("/", allowedTo("admin"), createUserValidator, createUser);

// @desc Update user @access Private/Admin
router.put("/:id", allowedTo("admin"), updateUserValidator, updateUser);

// @desc Delete user @access Private/Admin
router.delete("/:id", allowedTo("admin"), deleteUser);

// @desc Verify user @access Private/Admin
router.post(
  "/verify/:id",
  allowedTo("admin"),
  verifyBlockUserValidator,
  verifyUser
);

// @desc Block user @access Private/Admin
router.post(
  "/block/:id",
  allowedTo("admin"),
  verifyBlockUserValidator,
  blockUser
);

router.get("/loggedin", requireLogIn, getLoggedInUser);

router.post("/update/login", requireLogIn, updateUserDetails);

module.exports = router;
