const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

// Routes
const authRouters = require("./router/auth");
const userRouters = require("./router/user");
const productRouters = require("./router/product");
const categoryRouters = require("./router/category");
const stockRouters = require("./router/stock");
const cartRouters = require("./router/cart");
const wishlistRouters = require("./router/wishlist");
const addressRouters = require("./router/address");
const orderRouters = require("./router/order");
const walletRouters = require("./router/wallet");
const walletTransactionRouters = require("./router/walletTransaction");
const faqRouters = require("./router/faq");

// Connect to Database
require("./config/database");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { requireLogIn } = require("./middlewares/auth");
const Cart = require("./models/cartSchema");

// Middleware
app.use(bodyParser.json()); // This allows us to pass data from the form
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

//Parse Cookie header
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes Middlware
app.use("/user", userRouters);
app.use("/product", productRouters);
app.use("/category", categoryRouters);
app.use("/stock", stockRouters);
app.use("/cart", cartRouters);
app.use("/wishlist", wishlistRouters);
app.use("/address", addressRouters);
app.use("/order", orderRouters);
app.use("/wallet", walletRouters);
app.use("/transection", walletTransactionRouters);
app.use("/faq", faqRouters);
app.use("/", authRouters);

app.get("/", (req, res) => {
  res.json("Hello World!");
});
// Set a default environment port or custom port - 3000
const PORT = process.env.PORT || 3000;

// Start out application
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/cart/create-checkout-session", requireLogIn, async (req, res) => {
  const userId = req.crUser._id;
  console.log("🚀 ~ app.post ~ userId:", userId);

  const cart = await Cart.findOne({ user: req.crUser._id })
    .populate("cartItems.product")
    .populate({ path: "cartItems.color", select: "name" })
    .populate({ path: "cartItems.size", select: "name" });

  // const products2 = [
  //   {
  //     product: {
  //       // _id: "65c5cd87726627aea0480952",
  //       name: "product1",
  //       price: 100,
  //       coverImage: "uploads\\coverImages\\cover_1707462022597.jpg",
  //     },
  //     quantity: 1,
  //   },
  //   {
  //     product: {
  //       // _id: "65c5cd87726627aea0480952",
  //       name: "product1",
  //       price: 100,
  //       coverImage: "uploads\\coverImages\\cover_1707462022597.jpg",
  //     },
  //     quantity: 1,
  //   },
  // ];
  // console.log("🚀 ~ app.post ~ products2:", products2);

  // const temp = req.body.products1.map((item, i) => ({
  //   product: {
  //     name: item.product.name,
  //     price: item.product.price,
  //     // coverImage: item.product.coverImage,
  //   },
  //   quantity: item.quantity,
  // }));
  // console.log("🚀 ~ temp ~ temp:", temp);

  // const lineItems = await products.map((item) => {
  //   console.log("🚀 ~ lineItems ~ item:", item);

  //   return {
  //     price_data: {
  //       currency: "inr",
  //       product_data: {
  //         name: item?.product?.name,
  //         // images: [item?.product?.coverImage],
  //       },
  //       unit_amount: item?.product?.price * 100,
  //     },
  //     quantity: item?.quantity,
  //   };
  // });
  // console.log("🚀 ~ lineItems ~ lineItems:", lineItems);

  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ["card"],
  //   line_items: lineItems,
  //   mode: "payment",
  //   success_url: "http://localhost:3000/sucess",
  //   cancel_url: "http://localhost:3000/cancel",
  // });

  // res.json({ id: session.id, data: lineItems });
});
