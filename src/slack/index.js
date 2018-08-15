const express = require("express");
const winston = require("winston");

const { slashWF } = require("./warframe");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Helix Slack endpoint");
});

router.post("/slashes/warframe", (req, res) => {
  winston.debug(
    `User: ${req.body.user_name} (${req.body.user_id}) -> ${req.body.command} ${
      req.body.text
    }`
  );

  res.send("");

  slashWF(req.body);
});

module.exports = {
  router
};
