const Product = require("../models/productSchema");
const Stock = require("../models/stockSchema");
const Color = require("../models/colorSchema");
const Size = require("../models/sizeSchema");
const {
  successResponseWithData,
  notFoundResponse,
  successResponse,
  ErrorResponse,
} = require("../utils/apiResponse");

const asyncHandler = require("express-async-handler");


// @desc Get all products
// @access Private/Admin
exports.getallProducts = async (req, res) => {
  try {
    // Pagination
    const page = req.query.page || 1;
    const limit = 2;

    const products = await Product.find()
      .populate({ path: "category", select: "name" })
      .populate({ path: "color", select: "name" })
      .populate({ path: "size", select: "name" })
      .skip(page * limit)
      .limit(limit);
    console.log("🚀 ~ exports.getallProducts= ~ products:", products);

    res.status(200).json({
      results: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// @desc Get Single product
// @access Private/Admin
exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const product = await Product.findOne({ slug: slug })
      .populate({ path: "category", select: "name" })
      .populate({ path: "color", select: "name" })
      .populate({ path: "size", select: "name" })
      .populate({ path: "stocks", select: "color , size , quantity " });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// @desc Add a Product
// @access Private/Admin 
exports.addProduct = async (req, res) => {
  try {
    const { color, size } = req.body;
    // Access the uploaded file information from req.file

    // console.log("🚀 ~ exports.addProduct= ~ req.files:", req.files);
    console.log("🚀 ~ exports.addProduct= ~ req.body:", req.body);
    const coverImage = req.files["coverImage"]
      ? req.files["coverImage"][0].path
      : null;
    const images = req.files["images"]
      ? req.files["images"].map((image) => image.path)
      : [];

    // const Colors = ["red", "blue"];
    // const Sizes = ["S", "M", "L"];

    // Find or create colors and get their _ids
    const colorIds = await Promise.all(
      color.map(async (colorName) => {
        let color = await Color.findOne({ name: colorName });

        // If color doesn't exist, create it
        if (!color) {
          color = new Color({ name: colorName });
          await color.save();
        }

        return color._id;
      })
    );

    // Find or create sizes and get their _ids
    const sizeIds = await Promise.all(
      size.map(async (sizeName) => {
        let size = await Size.findOne({ name: sizeName });

        // If size doesn't exist, create it
        if (!size) {
          size = new Size({ name: sizeName });
          await size.save();
        }

        return size._id;
      })
    );

    // Create the product
    const newProduct = new Product({
      ...req.body,
      color: colorIds,
      size: sizeIds,
      coverImage,
      images,
      stocks: [],
    });

    const savedProduct = await newProduct.save();

    // Create stock entries for each color
    for (const colorId of colorIds) {
      for (const sizeId of sizeIds) {
        const newStock = new Stock({
          product: savedProduct._id,
          color: colorId,
          size: sizeId,
          quantity: 0,
        });

        const savedStock = await newStock.save();

        // Add the stock reference to the product's stocks array
        savedProduct.stocks.push(savedStock._id);
      }
    }

    // Update the product with the updated stocks array
    await savedProduct.save();

    successResponseWithData(res, "Product created successfully", savedProduct);
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc Update a Product
// @access Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { color, size } = req.body;
    const productSlug = req.params.slug;

    // Access the uploaded file information from req.files
    console.log("🚀 ~ exports.updateProduct ~ req.files:", req.files);

    // Check if coverImage and images are present in the request
    let coverImage = req.body.coverImage;
    let images = req.body.images;

    if (req.files) {
      // Update coverImage if present in req.files
      coverImage = req.files["coverImage"]
        ? req.files["coverImage"][0].path
        : coverImage;

      // Update images if present in req.files
      images = req.files["images"]
        ? req.files["images"].map((image) => image.path)
        : images;
    }

    // Find or create colors and get their _ids
    const colorIds = await Promise.all(
      color.map(async (colorName) => {
        let color = await Color.findOne({ name: colorName });

        // If color doesn't exist, create it
        if (!color) {
          color = new Color({ name: colorName });
          await color.save();
        }

        return color._id;
      })
    );

    // Find or create sizes and get their _ids
    const sizeIds = await Promise.all(
      size.map(async (sizeName) => {
        let size = await Size.findOne({ name: sizeName });

        // If size doesn't exist, create it
        if (!size) {
          size = new Size({ name: sizeName });
          await size.save();
        }

        return size._id;
      })
    );

    // Find and update the product in the database
    const updatedProduct = await Product.findOneAndUpdate(
      { slug: productSlug },
      {
        ...req.body,
        color: colorIds,
        size: sizeIds,
        coverImage,
        images,
      },
      { new: true }
    );

    if (updatedProduct) {
      successResponseWithData(
        res,
        "Product updated successfully",
        updatedProduct
      );
    } else {
      ErrorResponse(res, "Product not found", 404);
    }
  } catch (error) {
    console.error(error);
    ErrorResponse(res, "Internal Server Error");
  }
};

// @desc Delete a product
// @access Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await Product.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return notFoundResponse(res, `No Product for this id ${id}`);
  }

  successResponse(res, "Product Deleted successfully");
});

// @desc Search a product Based on name & desc.
// @access Public/User
exports.searchProduct = async (req, res) => {
  try {
    const searchTerm = req.query.query;

    // Create a MongoDB query based on the provided search term
    const query = {
      $or: [
        { name: new RegExp(searchTerm, "i") }, // Case-insensitive search
        { description: new RegExp(searchTerm, "i") },
      ],
    };

    // Fetch products based on the query
    const products = await Product.find(query);

    if (products.length === 0) {
      // No products found for the given search term
      return notFoundResponse(
        res,
        "No products found for the given search term"
      );
    }

    successResponseWithData(res, "Product searched successfully", products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc Filter a product Based on Min & Max Price
// @access Public/User
exports.filterProduct = async (req, res) => {
  try {
    const minPrice = parseInt(req.query.min);
    const maxPrice = parseInt(req.query.max);

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid price range" });
    }

    // Create a MongoDB query based on the provided price range
    const query = {
      price: { $gte: minPrice, $lte: maxPrice },
    };
    console.log("🚀 ~ exports.filterProductsByPrice ~ query:", query);

    // Fetch products based on the query
    const products = await Product.find(query);

    if (products.length === 0) {
      // No products found for the given price range
      return notFoundResponse(
        res,
        "No products found for the given price range"
      );
    }

    successResponseWithData(
      res,
      "Products filtered by price successfully",
      products
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.products = async (req, res) => {
  try {
    // Pagination
    const page = req.query.page || 0;
    const limit = 4;

    // Initial query for pagination
    const query = {};

    // Check for search query parameter
    if (req.query.query) {
      const searchTerm = req.query.query;
      query.$or = [
        { name: new RegExp(searchTerm, "i") },
        { description: new RegExp(searchTerm, "i") },
      ];
    }

    // Check for filter parameters
    if (req.query.min && req.query.max) {
      const minPrice = parseInt(req.query.min);
      const maxPrice = parseInt(req.query.max);

      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid price range" });
      }
    }

    const totalDocument = await Product.find().count();
    console.log("🚀 ~ exports.products= ~ totalDocument:", totalDocument);

    const products = await Product.find(query)
      .populate({ path: "category", select: "name" })
      .populate({ path: "color", select: "name" })
      .populate({ path: "size", select: "name" })
      .skip(page * limit)
      .limit(limit);

    // if (products.length === 0) {
    //   return notFoundResponse(res, "No products found for the given criteria");
    // }

    res.status(200).json({
      results: products.length,
      data: { total: totalDocument, products },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
