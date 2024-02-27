const { check, validationResult } = require("express-validator");

exports.ValidateCategoryCreate = [
  check("name").notEmpty().withMessage("category name is required"),
];

exports.isCategoryRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};
