var express = require("express");
var router = express.Router();
const mysql = require("mysql");

// const connection = mysql.createConnection({
//   host: "127.0.0.1",
//   user: "root",
//   password: "1qaz2wsx",
//   database: "dockschedule",
// });
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "1qaz2wsx",
  database: "dockschedule",
});

router.get("/", function (request, response) {
  // try{
  //   connection.query("select * from schedule where scheduledate = '2022-03-03'", async (error, rows, fields) => {
  //     console.log("the result is: ", rows);
  //     response =  rows;
  //   });
  // }catch(error){
  //   console.log("Query error: ", error);
  // }

  pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!

    // Use the connection
    connection.query(
      "select * from schedule where scheduledate = '2022-03-03'",
      function (error, results, fields) {
        console.log("the result is: ", results);
        response = results;
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) throw error;

        // Don't use the connection here, it has been returned to the pool.
      }
    );
    console.log(response);
  });
});

module.exports = router;
