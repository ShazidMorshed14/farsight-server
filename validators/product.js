const { check, validationResult } = require("express-validator");

exports.validateProductCreate = [
  check("name").notEmpty().withMessage("product name is required"),
  check("price").notEmpty().withMessage("product price is required"),
  check("description")
    .notEmpty()
    .withMessage("product description is required"),
];

exports.isProductRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};
