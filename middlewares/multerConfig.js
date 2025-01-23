const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "coverImage") {
      cb(null, "./uploads/coverImages/");
    } else if (file.fieldname === "images") {
      cb(null, "./uploads/images/");
    } else {
      cb(new Error("Invalid fieldname"), false);
    }
  },
  filename: function (req, file, cb) {
    const prefix = file.fieldname === "coverImage" ? "cover_" : "img_";
    cb(null, prefix + Date.now() + path.extname(file.originalname));
  },
});

// Define file filter for both cover images and PDF files
const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    const error = new Error(
      "Invalid file type. Only Image files are allowed."
    );
    cb(error, false);
  }
};

// Configure Multer with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
