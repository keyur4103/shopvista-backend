const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String ,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    color: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Color",
    },
    size: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Size",
    },
    coverImage: {
      type: String,
      // required: true,
    },
    images: {
      type: [String],
      // required: true,
    },
    stocks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate and set the slug before saving
productSchema.pre("save", function (next) {
  this.slug = slugify(`${this.name}-${Date.now()}`, {
    lower: true,
  });
  next();
});

productSchema.set("toJSON", {
  virtuals: true,
});

productSchema.virtual("productCoverImage").get(function () {
  return "http://localhost:3000/" + this.coverImage;
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
