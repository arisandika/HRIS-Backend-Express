// import express
const express = require("express");

// import cors
const cors = require("cors");

// import bodyParser
const bodyParser = require("body-parser");

// import routes
const router = require("./routes");

// init app
const app = express();

// use cors
app.use(cors());

// use body parser
app.use(bodyParser.urlencoded({ extended: false }));

// parse json
app.use(bodyParser.json());

// set port
const port = 3000;

// set route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", router);

// start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
