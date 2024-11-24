const { body } = require("express-validator");
const prisma = require("../../prisma/client");

const validateEmployee = [
  body("full_name").notEmpty().withMessage("Full name is required"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      if (!email) {
        throw new Error("Email is required");
      }
      const user = await prisma.employeeLogin.findUnique({
        where: { email: email },
      });
      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("phone_number")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number format"),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 255 })
    .withMessage("Address can be at most 255 characters long"),

  body("id_division")
    .notEmpty()
    .withMessage("Division ID is required")
    .isInt()
    .withMessage("Division ID must be an integer"),

  body("id_department")
    .notEmpty()
    .withMessage("Department ID is required")
    .isInt()
    .withMessage("Department ID must be an integer"),

  body("hire_date")
    .notEmpty()
    .withMessage("Hire date is required")
    .isISO8601()
    .withMessage("Hire date must be in the format YYYY-MM-DD")
    .toDate(),
];

module.exports = { validateEmployee };
