const express = require("express");
const prisma = require("../prisma/client");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// function register
const register = async (req, res) => {
  // Periksa hasil validasi
  const errors = validationResult(req);

  // Jika ada error
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
        "Registration successful. Please check your email for verification.",
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

module.exports = { register };
