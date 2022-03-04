var express = require("express");
var router = express.Router();
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "1qaz2wsx",
  database: "dockschedule",
});

router.get("/", function (request, response) {
  connection.connect();

  connection.query("select * from schedule", (err, rows, fields) => {
    if (err) throw err;

    console.log("the result is: ", rows[0].solution);
  });
  connection.end();
  return console.log("terminado");
});

module.exports = router;
