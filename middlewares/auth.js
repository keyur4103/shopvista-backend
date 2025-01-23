const ApiError = require("../utils/APIError");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const { expressjwt } = require("express-jwt");
const {
  tokenNotFoundResponse,
  notAllowedResponse,
} = require("../utils/apiResponse");
require("dotenv").config(); // access environment variables

exports.requireSignIn = expressjwt({
  // if the token is valid express-jwt appends the verified users id
  // in an auth key to the request object
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

// exports.isAuth = (req, res, next) => {
//   let user = req.Profile && req.auth && req.Profile._id == req.auth.user_id;

//   if (!user) {
//     return res.status(403).send("Access Denied");
//   }
//   next();
// };

exports.isAdmin = (req, res, next) => {
  if (req.auth.user_role == 0) {
    return res.status(403).json({ error: "Admin Resource, Access Denied !" });
  }
  next();
};

// @desc Make sure the user is logged in
exports.requireLogIn = async (req, res, next) => {
  //   Check if token exist, if exist get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new tokenNotFoundResponse(
        res,
        "You are not login, Please login to get access this route"
      )
    );
  }

  // Verify token (no change happens, expired token)
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,

    function (err, decoded) {
      console.log("🚀 ~ exports.requireLogIn= ~ token:", token);

      if (err) {
        if (err.name === "JsonWebTokenError") {
          next(new ApiError(err.message, 401));
        }
      } else {
        console.log("🚀 ~ exports.requireLogIn= ~ decoded:", decoded);
        return decoded;
      }
    }
  );

  if (decoded) {
    // Check if user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new ApiError(
          "The user that belong to this token does no longer exist",
          401
        )
      );
    }
    req.crUser = currentUser;
    next();
  }
};

// @desc Make sure the user is logged in the same own url
exports.isAuth = (req, res, next) => {
  let user =
    req.Profile &&
    req.crUser &&
    JSON.stringify(req.Profile) === JSON.stringify(req.crUser);

  if (!user) {
    return res.status(403).send("Access Denied");
  }
  next();
};

exports.allowedTo =
  (...role) =>
  (req, res, next) => {
    //  access roles
    //  access registered user (req.crUser.role)
    if (!role.includes(req.crUser.role)) {
      console.log("🚀 ~ req.crUser.role:", req.crUser.role);
      return notAllowedResponse(
        res,
        "You are not allowed to access this route"
      );
    }

    next();
  };
