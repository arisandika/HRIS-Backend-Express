const { body } = require("express-validator");
const prisma = require("../../prisma/client");

const validateDepartment = [
  body("name").notEmpty().withMessage("Department name is required"),
];

module.exports = { validateDepartment };
