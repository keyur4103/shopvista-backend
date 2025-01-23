const Category = require("../models/categorySchema");
const {
  successResponseWithData,
  ErrorResponse,
  //   notFoundResponse,
  successResponse,
} = require("../utils/apiResponse");
const slugify = require("slugify");

// @desc Create a category
// @access Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = new Category({
      name,
    });

    const savedCategory = await category.save();

    successResponseWithData(
      res,
      "Category created successfully",
      savedCategory
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc Update a category
// @access Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const slug = slugify(name, { lower: true });

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return ErrorResponse(res, "Category not found", 404);
    }

    successResponseWithData(
      res,
      "Category updated successfully",
      updatedCategory
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc get all category
// @access Private/Admin
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    successResponseWithData(
      res,
      "All Categories retrieved successfully",
      categories
    );
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc Delete category
// @access Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Category.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return ErrorResponse(res, "Category not found");
    }

    successResponse(res, "Category deleted successfully");
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};
