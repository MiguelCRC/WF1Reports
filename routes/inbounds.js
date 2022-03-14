var express = require("express");
var router = express.Router();
const inbounds = require('../services/inbounds');

router.get("/", async function (request, response) {
  if(request.query.date){
    try{
      const answer = await inbounds.getInboundByDate(request.query.date);
      return response.status(200).json(
        answer
        );
    }catch(error){
      return response.status(500).json({
        message: error.message
      });
    }
  }else if(request.query.initialDate && request.query.finalDate){
    return response.status(200).json({
      finalDate: request.query.finalDate
    });
  }else{
    return response.status(500).json({
      message: "No Date input!"
    })
  }
});

module.exports = router;
