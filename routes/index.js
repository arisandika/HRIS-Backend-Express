const express = require("express");

const router = express.Router();

// import controllers
const registerController = require("../controllers/RegisterController");
const loginController = require("../controllers/LoginController");
const employeeController = require("../controllers/EmployeeController");
const departmentController = require("../controllers/DepartmentController");
const divisionController = require("../controllers/DivisionController");

// import validators
const { validateRegister, validateLogin } = require("../utils/validators/auth");
const { validateEmployee } = require("../utils/validators/employee");
const { validateDepartment } = require("../utils/validators/department");
const { validateDivision } = require("../utils/validators/division");

// import verify token
const verifyToken = require("../middlewares/auth");

// Auth
router.post("/register", validateRegister, registerController.register);
router.post("/login", validateLogin, loginController.login);

// Employee
router.get("/admin/employees", verifyToken, employeeController.getEmployees);
router.post("/admin/employees", verifyToken, validateEmployee, employeeController.createEmployee);
router.get("/admin/employees/:id", verifyToken, employeeController.getEmployeeById);
router.put("/admin/employees/:id", verifyToken, validateEmployee, employeeController.updateEmployee);
router.delete("/admin/employees/:id", verifyToken, employeeController.deleteEmployee);

// Department
router.get("/admin/departments", verifyToken, departmentController.getDepartments);
router.post("/admin/departments",  verifyToken, validateDepartment, departmentController.createDepartment);
router.get("/admin/departments/:id", verifyToken, departmentController.getDepartmentById);
router.put("/admin/departments/:id",  verifyToken, validateDepartment, departmentController.updateDepartment);
router.delete("/admin/departments/:id", verifyToken, departmentController.deleteDepartment);

// Divisions
router.get("/admin/divisions", verifyToken, divisionController.getDivisions);
router.post("/admin/divisions",  verifyToken, validateDivision, divisionController.createDivision);
router.get("/admin/divisions/:id", verifyToken, divisionController.getDivisionById);
router.put("/admin/divisions/:id", verifyToken, validateDivision, divisionController.updateDivision);
router.delete("/admin/divisions/:id", verifyToken, divisionController.deleteDivision);

module.exports = router;
