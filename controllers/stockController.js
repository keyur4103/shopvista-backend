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

    // Build the query object dynamically
    let query = { product: productId };

    if (colorId) {
      query.color = colorId; // Ensure colorId is valid (ObjectId)
    }

    if (sizeId) {
      query.size = sizeId; // Ensure sizeId is valid (ObjectId)
    }

    // Log the query to check what we're searching for
    console.log("Query being used:", query);

    // Find the stock entry for the product (and color/size if provided)
    const stock = await Stock.findOne(query);

    if (!stock) {
      return ErrorResponse(res, "Stock entry not found", 404);
    }

    // Ensure quantityChange is a valid number
    const quantity = +quantityChange;
    if (isNaN(quantity)) {
      return ErrorResponse(res, "Invalid quantity change value");
    }

    // Determine the operation based on the 'action'
    if (action === "add") {
      stock.quantity = +stock.quantity + quantity;
    } else if (action === "remove") {
      stock.quantity = +stock.quantity - quantity;

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
