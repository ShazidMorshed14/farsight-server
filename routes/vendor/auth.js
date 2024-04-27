const express = require("express");
const router = express.Router();

//importing the controllers
const authControllers = require("../../controllers/vendor/auth");

//importing validators
const {
  validateSignupRequest,
  isRequestValidated,
  validateSigninRequest,
} = require("../../validators/auth");

router.post(
  "/signin",
  validateSigninRequest,
  isRequestValidated,
  authControllers.signin
);

router.put("/reset-password/:id", authControllers.resetPassword);

module.exports = router;
