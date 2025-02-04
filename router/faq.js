const express = require("express");
const { allowedTo, requireLogIn } = require("../middlewares/auth");
const {
  createFAQ,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  getAllFAQs,
} = require("../controllers/faqController");
const {
  faqIdParamValidator,
  updateFAQValidator,
  createFAQValidator,
} = require("../validations/faqValidation");
const router = express.Router();

// Admin
router.use(requireLogIn);

// @desc Get all category @access Private/Admin
router.post("/", allowedTo("admin"), createFAQValidator, createFAQ);

// @desc add FAQ  @access Private/Admin
router.get("/:id", allowedTo("admin"), faqIdParamValidator, getFAQById);

// @desc add FAQ  @access Private/Admin
router.put(
  "/:id",
  allowedTo("admin"),
  faqIdParamValidator,
  updateFAQValidator,
  updateFAQ
);

// @desc add FAQ  @access Private/Admin
router.delete("/:id", allowedTo("admin"), faqIdParamValidator, deleteFAQ);

// @desc add FAQ  @access Private/Admin
router.get("/", getAllFAQs);

module.exports = router;
