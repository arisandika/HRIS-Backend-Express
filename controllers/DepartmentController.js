const express = require("express");
const prisma = require("../prisma/client");
const { validationResult } = require("express-validator");

// function to get all departments
const getDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total_data = await prisma.department.count();
    const sortBy = req.query.sortBy || "id";
    const sortOrder = req.query.sortOrder || "asc";

    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // menambahkan kolom "no" sebagai nomor urut
    const departmentsWithNo = departments.map((department, index) => ({
      no: skip + index + 1, // increment number berdasarkan page dan limit
      ...department,
    }));

    res.status(200).send({
      success: true,
      message: "Departments fetched successfully",
      data: departmentsWithNo,
      total_data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to insert department
const createDepartment = async (req, res) => {
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
    // tambahkan department baru
    const department = await prisma.department.create({
      data: {
        name: req.body.name,
        description: req.body.description,
      },
    });

    // kirim respon
    res.status(200).send({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to get department by id
const getDepartmentById = async (req, res) => {
  // get id
  const { id } = req.params;

  try {
    const department = await prisma.department.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        description: true,
      },
    });

    // kirim respon
    res.status(200).send({
      success: true,
      message: `Get department by id ${id} successfully`,
      data: department,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to update department
const updateDepartment = async (req, res) => {
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

  try {
    const department = await prisma.department.update({
      where: {
        id: Number(id),
      },
      data: {
        name: req.body.name,
        description: req.body.description,
      },
    });

    // kirim respon
    res.status(200).send({
      success: true,
      message: `Department with id ${id} updated successfully`,
      data: department,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to delete department
const deleteDepartment = async (req, res) => {
  // get id
  const { id } = req.params;

  try {
    const department = await prisma.department.delete({
      where: {
        id: Number(id),
      },
    });

    if (!department) {
      return res.status(404).send({
        success: false,
        message: `Department with id ${id} not found`,
      });
    }

    // kirim respon
    res.status(200).send({
      success: true,
      message: `Department with id ${id} deleted successfully`,
      data: department,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
