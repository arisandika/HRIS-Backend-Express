const express = require("express");
const prisma = require("../prisma/client");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// function to get all employees
const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;
    const total_data = await prisma.employee.count();
    const sortBy = req.query.sortBy || "id";
    const sortOrder = req.query.sortOrder || "asc";

    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        login: {
          select: {
            email: true,
          },
        },
        fullname: true,
        phone_number: true,
        address: true,
        hire_date: true,
        department: {
          select: {
            name: true,
          },
        },
        division: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // menambahkan kolom "no" sebagai nomor urut
    const employeesWithNo = employees.map((employee, index) => ({
      no: skip + index + 1, // increment number berdasarkan page dan limit
      ...employee,
    }));

    res.status(200).send({
      success: true,
      message: "Employees fetched successfully",
      data: employeesWithNo,
      total_data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to insert user
const createEmployee = async (req, res) => {
  // periksa hasil validasi
  const errors = validationResult(req);

  // jika ada error
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  try {
    // jalankan transaksi
    const { employeeLogin, employee } = await prisma.$transaction(
      async (prisma) => {
        // buat employee login baru
        const employeeLogin = await prisma.employeeLogin.create({
          data: {
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            ip_address: req.ip,
            pin_active: crypto.randomBytes(16).toString("hex"),
          },
        });

        // buat employee baru dengan id_login yang baru saja dibuat
        const employee = await prisma.employee.create({
          data: {
            login: {
              connect: {
                id: employeeLogin.id,
              },
            },
            fullname: req.body.fullname,
            phone_number: req.body.phone_number,
            address: req.body.address,
            hire_date: new Date(req.body.hire_date),
            is_active: 0,
            is_delete: 0,
            department: {
              connect: {
                id: req.body.id_department,
              },
            },
            division: {
              connect: {
                id: req.body.id_division,
              },
            },
          },
        });

        return { employeeLogin, employee };
      }
    );

    // destructure employee untuk menghilangkan password
    const {
      password,
      address,
      position,
      id_department,
      id_division,
      hire_date,
      is_active,
      is_delete,
      ...employeeData
    } = employee;

    // menambahkan beberapa data pada employeeData untuk dikirim dalam response
    employeeData.email = employeeLogin.email;

    // kirim response jika berhasil
    return res.status(201).json({
      success: true,
      message:
        "Employee created successfully. A pin has been sent to their email.",
      data: employeeData,
    });
  } catch (error) {
    // jika terjadi error, Prisma otomatis rollback transaksi
    return res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
      error: error.message,
    });
  }
};

// function to get user by id
const getEmployeeById = async (req, res) => {
  // get id
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // kirim respon
    res.status(200).send({
      success: true,
      message: `Get user by id ${id} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to update user
const updateEmployee = async (req, res) => {
  // get id
  const { id } = req.params;

  // periksa validasi
  const errors = validationResult(req);

  // jika ada error
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      },
    });

    // kirim respon
    res.status(200).send({
      success: true,
      message: `User with id ${id} updated successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to delete user
const deleteEmployee = async (req, res) => {
  // get id
  const { id } = req.params;

  try {
    const user = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: `User with id ${id} not found`,
      });
    }

    // kirim respon
    res.status(200).send({
      success: true,
      message: `User with id ${id} deleted successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
