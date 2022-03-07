var express = require("express");
var router = express.Router();
const inbounds = require('../services/inbounds');

router.get("/", function (request, response) {
  try{
    response.json(await inbounds.getInboundByDate(request.query.date));
  }catch(error){
    console.error("Query error: ", error.message);
  }
});

module.exports = router;
