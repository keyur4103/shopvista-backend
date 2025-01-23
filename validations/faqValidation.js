const { body, param } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createFAQValidator = [
  body("question").notEmpty().withMessage("Question is required."),
  body("answer").notEmpty().withMessage("Answer is required."),
  validatorMiddleware,
];

exports.updateFAQValidator = [
  body("question").optional().notEmpty().withMessage("Question is required."),
  body("answer").optional().notEmpty().withMessage("Answer is required."),
  validatorMiddleware,
];

exports.faqIdParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("FAQ ID is required.")
    .isMongoId()
    .withMessage("Invalid FAQ ID."),
  validatorMiddleware,
];
