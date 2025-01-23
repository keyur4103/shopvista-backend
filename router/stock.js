const express = require("express");
const router = express.Router();
const { allowedTo, requireLogIn } = require("../middlewares/auth");
const { updateStock, getallStock } = require("../controllers/stockController");
const { validateStockUpdate } = require("../validations/stockValidation");

// Admin
router.use(requireLogIn);

// @desc Update Stock @access Private/Admin
router.post("/update", allowedTo("admin"), validateStockUpdate, updateStock);

// @desc Get All Stock @access Private/Admin
router.get("/", allowedTo("admin"), getallStock);

module.exports = router;
