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
  try{
    connection.connect();
  }catch(error){
    console.log("Start connection error: ",error);
  }

  try{
    connection.query("select * from schedule where scheduledate = '2022-03-03'", async (err, rows, fields) => {
      console.log("the result is: ", rows);
      response =  rows;
    });
  }catch(error){
    console.log("Query error: ", error);
  }

  try{
    connection.end();
    console.log("terminado");
  }catch(error){
    console.log("End connection: ", error);
  }

  console.log(response);
});

module.exports = router;
