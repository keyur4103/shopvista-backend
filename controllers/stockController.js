const Stock = require("../models/stockSchema");
const Product = require("../models/productSchema");
const {
  successResponseWithData,
  ErrorResponse,
} = require("../utils/apiResponse");

// Update Stock API
exports.updateStock = async (req, res) => {
  try {
    const { productId, colorId, sizeId, quantityChange, action } = req.body;
    console.log("🚀 ~ exports.updateStock= ~ req.body:", req.body);

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return ErrorResponse(res, "Product not found", 404);
    }

    // Find the stock entry for the product and color
    const stock = await Stock.findOne({
      product: productId,
      color: colorId,
      size: sizeId,
    });

    if (!stock) {
      return ErrorResponse(res, "Stock entry not found");
    }

    // Determine the operation based on the 'action'
    if (action === "add") {
      stock.quantity = +stock.quantity + +quantityChange;
    } else if (action === "remove") {
      stock.quantity = +stock.quantity - +quantityChange;

      // Ensure the stock quantity does not go below zero
      stock.quantity = Math.max(stock.quantity, 0);
    } else {
      return ErrorResponse(
        res,
        "Invalid 'action' value. It should be 'add' or 'remove'."
      );
    }

    // Save the updated stock entry
    const updatedStock = await stock.save();

    successResponseWithData(res, "Stock updated successfully", updatedStock);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// Get All Stocks
exports.getallStock = async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate({ path: "product", select: "name" })
      .populate({ path: "color", select: "name" })
      .populate({ path: "size", select: "name" })
      .exec();

    res.status(200).json({
      results: stock.length,
      data: stock,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
