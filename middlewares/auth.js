const express = require("express");

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // get token
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).send({ message: "Not authorized" });
  }

  // verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized" });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
