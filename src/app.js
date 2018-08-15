const bodyParser = require("body-parser");
const express = require("express");
const winston = require("winston");

// Initialize logger
const { combine, timestamp, printf } = winston.format;
const customFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});
winston.configure({
  level: "debug",
  format: combine(timestamp(), customFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/combined.log",
      format: combine(timestamp(), customFormat)
    }),
    new winston.transports.File({
      level: "error",
      filename: "./logs/error.log",
      format: combine(timestamp(), customFormat)
    })
  ]
});

const config = require("./config");
const slack = require("./slack");

const PORT = config.port || process.argv[2] || 3000;

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use("*", (req, res, next) => {
  winston.debug(`${req.method} ${req.originalUrl}`);

  next();
});

app.get("/", (req, res) => {
  res.send("🤖 Helix");
});

app.use("/slack", slack.router);

app.listen(PORT, error => {
  if (error) {
    winston.error(error.message);
  } else {
    winston.info(`Running on port ${PORT}`);
  }
});
