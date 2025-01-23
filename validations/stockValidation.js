const { body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.validateStockUpdate = [
  body("productId").isMongoId().withMessage("Invalid product ID"),
  body("colorId").isMongoId().withMessage("Invalid color ID"),
  body("sizeId").isMongoId().withMessage("Invalid size ID"),
  // body("quantityChange")
  //   .isInt()
  //   .withMessage("Quantity change must be an integer"),
  validatorMiddleware,
];
