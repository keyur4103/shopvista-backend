const express = require("express");
const { allowedTo, requireLogIn } = require("../middlewares/auth");
const {
  getAllCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} = require("../controllers/categoryController");
const {
  updateCategoryValidator,
  createCategoryValidator,
} = require("../validations/categoryValidation");
const router = express.Router();

// Admin
// router.use(requireLogIn);

// @desc Get all category @access Private/Admin
router.get("/", getAllCategories);

// @desc Create category @access Private/Admin
router.post("/", createCategoryValidator, createCategory);

// @desc Update category @access Private/Admin
router.put("/:id", updateCategoryValidator, updateCategory);

// @desc Delete category @access Private/Admin
router.delete("/:id", deleteCategory);

module.exports = router;
