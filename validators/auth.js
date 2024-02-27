const { check, validationResult } = require("express-validator");

exports.validateSignupRequest = [
  check("name").notEmpty().withMessage("firstName is required"),
  check("email").isEmail().withMessage("Valid Email is required"),
  check("phone").notEmpty().withMessage("Phone Number is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character long"),
];

exports.validateSigninRequest = [
  check("identifier")
    .notEmpty()
    .withMessage("Valid Email or Phone is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character long"),
];

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};
