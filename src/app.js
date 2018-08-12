const bodyParser = require("body-parser");
const express = require("express");

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

app.get("/", (req, res) => {
  res.send("🤖 Helix");
});

app.use("/slack", slack.router);

app.listen(PORT, error => {
  if (error) {
    console.log(error.message);
  } else {
    console.log(`Running on port ${PORT}`);
  }
});
