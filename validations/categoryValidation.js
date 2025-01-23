const { body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createCategoryValidator = [
  body("name").notEmpty().withMessage("Name is required."),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  body("name").optional().notEmpty().withMessage("Name is required."),
  validatorMiddleware,
];
