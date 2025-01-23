const FAQ = require("../models/faqSchema");
const { successResponseWithData, ErrorResponse, successResponse } = require("../utils/apiResponse");

// @desc      Create a FAQ
// @access    Private/Admin
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = new FAQ({ question, answer });
    const savedFAQ = await faq.save();
    successResponseWithData(res, "FAQ created successfully", savedFAQ);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc      Get a single FAQ by ID
// @access    Private/Admin
exports.getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) {
      return ErrorResponse(res, "FAQ not found", 404);
    }
    successResponseWithData(res, "FAQ retrieved successfully", faq);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc      Update a FAQ
// @access    Private/Admin
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    const updatedFAQ = await FAQ.findByIdAndUpdate(id, { question, answer }, { new: true });
    if (!updatedFAQ) {
      return ErrorResponse(res, "FAQ not found", 404);
    }
    successResponseWithData(res, "FAQ updated successfully", updatedFAQ);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc      Delete a FAQ
// @access    Private/Admin
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await FAQ.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return ErrorResponse(res, "FAQ not found", 404);
    }
    successResponse(res, "FAQ deleted successfully");
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc      Get all FAQs
// @access    Private/Admin
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();
    successResponseWithData(res, "All FAQs retrieved successfully", faqs);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};
