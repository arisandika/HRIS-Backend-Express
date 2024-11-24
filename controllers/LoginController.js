const express = require("express");
const prisma = require("../prisma/client");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// function login
const login = async (req, res) => {
  // periksa hasil validasi
  const errors = validationResult(req);

  // jika ada error
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Email or password is incorrect",
      errors: errors.array(),
    });
  }

  try {
    // cari user
    const user = await prisma.employeeLogin.findFirst({
      where: {
        email: req.body.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        employee: {
          select: {
            id: true,
            fullname: true,
            phone_number: true,
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
        },
      },
    });

    if (user && user.employee && user.employee.department && user.employee.division) {
      user.employee.id_employee = user.employee.id;
      user.employee.name_department = user.employee.department.name;
      user.employee.name_division = user.employee.division.name;
      delete user.employee.department;
      delete user.employee.division;
    }

    // jika user tidak ditemukan
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // bycrypt password
    const passwordIsMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordIsMatch) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    // generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // destructure user untuk menyimpan data user tanpa password
    const { password, ...userData } = user;

    // kirim respon
    return res.status(200).send({
      success: true,
      message: "Login success",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

module.exports = { login };
