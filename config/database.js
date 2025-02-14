const mongoose = require("mongoose");
require("dotenv").config(); // access environment variables

const MONGO_URI = "mongodb://localhost:27017/ShopVista";
const MONGO_URI_PROD =
  "mongodb+srv://kfataniya637:aDbnSIDTGEaijXEu@cluster1.3bs56qk.mongodb.net/eventmanagement";


mongoose.set("strictQuery", false);

mongoose
  .connect(MONGO_URI_PROD)
  .then(() => {
    console.log("Connect to MongooDB ✅");
  })
  .catch((err) => {
    console.log(err);
  });
