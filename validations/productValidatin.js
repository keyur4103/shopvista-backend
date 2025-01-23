const { body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.addProductValidation = [
  body("name")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Product name is required."),
  body("description")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Product description is required."),
  body("category")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Product category is required."),
  body("price")
    .isNumeric()
    .notEmpty()
    .withMessage("Product price is required."),
  // body("color").isArray().notEmpty().withMessage("Product color is required."),
  //   body("coverImage")
  //     .trim()
  //     .isString()
  //     .optional({ nullable: true })
  //     .withMessage("Cover image must be a string."),
  //   body("images")
  //     .isArray({ min: 1 })
  //     .withMessage("At least one image is required."),
  validatorMiddleware,
];

exports.updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Product name is required."),
  body("description")
    .optional()
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Product description is required."),
  body("category")
    .optional()
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Product category is required."),
  body("price")
    .optional()
    .isNumeric()
    .notEmpty()
    .withMessage("Product price is required."),
  body("priceAfterDiscount")
    .optional()
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Discounted price is required."),
  // body("color")
  //   .optional()
  //   .isArray()
  //   .notEmpty()
  //   .withMessage("Product color is required."),
  body("quantity")
    .optional()
    .isNumeric()
    .notEmpty()
    .withMessage("Product quantity is required."),
  //   body("coverImage")
  //     .trim()
  //     .isString()
  //     .optional({ nullable: true })
  //     .withMessage("Cover image must be a string."),
  //   body("images")
  //     .isArray({ min: 1 })
  //     .withMessage("At least one image is required."),
  validatorMiddleware,
];

exports.validateFilterByPrice = [
  body("min")
    .isNumeric()
    .withMessage("Min price must be a numeric value")
    .isFloat({ gt: 0 })
    .withMessage("Min price must be a positive number"),

  body("max")
    .isNumeric()
    .withMessage("Max price must be a numeric value")
    .isFloat({ gt: 0 })
    .withMessage("Max price must be a positive number")
    .custom((value, { req }) => {
      const minPrice = parseFloat(req.query.min);
      const maxPrice = parseFloat(value);

      if (isNaN(minPrice) || isNaN(maxPrice) || minPrice >= maxPrice) {
        throw new Error("Max price must be greater than Min price");
      }

      return true;
    }),
  validatorMiddleware,
];
