var express = require("express");
var router = express.Router();
const inbounds = require('../services/inbounds');

router.get("/", async function (request, response) {
  try{
    var answer = await inbounds.getInboundByDate(request.query.date);
    response.json({inbounds: answer.data});
  }catch(error){
    console.error("Query error: ", error.message);
  }
});

module.exports = router;
