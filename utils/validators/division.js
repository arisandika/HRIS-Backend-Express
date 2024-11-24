const { body } = require("express-validator");
const prisma = require("../../prisma/client");

const validateDivision = [
  body("name").notEmpty().withMessage("Division name is required"),
];

module.exports = { validateDivision };
