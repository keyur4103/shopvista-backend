const express = require("express");
const multer = require("multer");
const { requireLogIn, allowedTo } = require("../middlewares/auth");
const {
  addProduct,
  deleteProduct,
  getallProducts,
  updateProduct,
  filterProduct,
  searchProduct,
  products,
  getProductBySlug,
} = require("../controllers/productController");
const router = express.Router();
const upload = require("../middlewares/multerConfig");
const {
  addProductValidation,
  updateProductValidation,
  validateFilterByPrice,
} = require("../validations/productValidatin");

// @desc Get all products @access Public/User
// router.get("/", getallProducts);

// @desc Get Single product @access Public/User
router.get("/:slug", getProductBySlug);

// @desc Create product @access Private/Admin
router.post(
  "/",
  (req, res, next) => {
    // Handle multer errors and send API response
    upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "images", maxCount: 4 },
    ])(req, res, function (err) {
      console.log("Received files:", req.files);
      if (err instanceof multer.MulterError) {
        // Multer error
        return res.status(400).json({ status: 400, message: err.message });
      } else if (err) {
        // Custom fileFilter error
        return res
          .status(err.status || 500)
          .json({ status: err.status || 500, message: err.message });
      }
      next();
    });
  },
  addProductValidation,
  addProduct
);

// @desc Update product @access Private/Admin
router.put(
  "/:slug",
  (req, res, next) => {
    // Handle multer errors and send API response
    upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "images", maxCount: 4 },
    ])(req, res, function (err) {
      console.log("Received files:", req.files);
      if (err instanceof multer.MulterError) {
        // Multer error
        return res.status(400).json({ status: 400, message: err.message });
      } else if (err) {
        // Custom fileFilter error
        return res
          .status(err.status || 500)
          .json({ status: err.status || 500, message: err.message });
      }
      next();
    });
  },
  updateProductValidation,
  updateProduct
);

// @desc Delete a Product @access Private/Admin
router.delete("/:id", requireLogIn, allowedTo("admin"), deleteProduct);

// @desc Search a productr @access Public/User
router.get("/search", searchProduct);

// @desc Filter a productr @access Public/User
router.get("/filter", validateFilterByPrice, filterProduct);

// @desc Filter a productr @access Public/User
router.get("/",  products);

module.exports = router;
