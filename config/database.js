const mongoose = require("mongoose");
require("dotenv").config(); // access environment variables

const MONGO_URI =
  "mongodb+srv://kfataniya637:aDbnSIDTGEaijXEu@cluster1.3bs56qk.mongodb.net/shopvista";

mongoose.set("strictQuery", false);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connect to MongooDB ✅");
  })
  .catch((err) => {
    console.log(err);
  });
