const express = require("express");
const prisma = require("../prisma/client");
const { validationResult } = require("express-validator");

// function to get all divisions
const getDivisions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const total_data = await prisma.division.count();
  const sortBy = req.query.sortBy || "id";
  const sortOrder = req.query.sortOrder || "asc";

  try {
    const divisions = await prisma.division.findMany({
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
    const divisionsWithNo = divisions.map((division, index) => ({
      no: skip + index + 1, // increment number berdasarkan page dan limit
      ...division,
    }));

    res.status(200).send({
      success: true,
      message: "Divisions fetched successfully",
      data: divisionsWithNo,
      total_data
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to insert division
const createDivision = async (req, res) => {
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
    // tambahkan division baru
    const division = await prisma.division.create({
      data: {
        name: req.body.name,
        description: req.body.description,
      },
    });

    // kirim respon
    res.status(200).send({
      success: true,
      message: "division created successfully",
      data: division,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to get division by id
const getDivisionById = async (req, res) => {
  // get id
  const { id } = req.params;

  try {
    const division = await prisma.division.findUnique({
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
      message: `Get division by id ${id} successfully`,
      data: division,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to update division
const updateDivision = async (req, res) => {
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
    const division = await prisma.division.update({
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
      message: `Division with id ${id} updated successfully`,
      data: division,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// function to delete division
const deleteDivision = async (req, res) => {
  // get id
  const { id } = req.params;

  try {
    const division = await prisma.division.delete({
      where: {
        id: Number(id),
      },
    });

    if (!division) {
      return res.status(404).send({
        success: false,
        message: `Division with id ${id} not found`,
      });
    }

    // kirim respon
    res.status(200).send({
      success: true,
      message: `Division with id ${id} deleted successfully`,
      data: division,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDivisions,
  createDivision,
  getDivisionById,
  updateDivision,
  deleteDivision,
};
