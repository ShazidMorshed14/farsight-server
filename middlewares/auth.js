require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const isAuth = (req, res, next) => {
  const { authorization } = req.headers;
  //console.log(authorization);

  if (!authorization) {
    return res.status(401).json({ message: "token not authorized" });
  } else {
    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        return res.status(401).json({ message: err.message });
      } else {
        const { _id } = payload;
        //console.log(_id);

        User.findOne({ _id: _id })
          .then((foundUser) => {
            if (foundUser) {
              req.user = foundUser;
              req.user.password = undefined; //hiding the hashed password
              //console.log(req.user);
              return next();
            } else {
              return res.status(404).json({ message: "No user exists" });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req?.user);
  if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
    return next();
  } else {
    return res.status(409).json({ message: "Access Denied" });
  }
};

module.exports = { isAuth, isAdmin };
