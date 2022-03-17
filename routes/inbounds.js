var express = require("express");
var router = express.Router();
const csv = require('fast-csv');
const inbounds = require('../services/inbounds');

router.get("/", async function (request, response) {
  response.setHeader('content-type', 'text/csv');
  var csvStream = csv.format({headers: ['ID','Date','Customer','Warehouse','BOL','ArriveTime','ScheduleTime','ArriveStatus','DepartureTime','OnSiteTime','CreationDate','Carrier','Brand'], objectMode: true});
  csvStream.pipe(response);  
  if(request.query.date){
    response.setHeader('Content-disposition', `attachment; filename=InboundReport${request.query.date}.csv`);
      try{
        const answer = await inbounds.getInboundByDate(request.query.date,);

        answer.forEach((array) =>{
          array.inbounds.forEach((inbound) =>{
            csvStream.write({
              'ID':inbound.id,
              'Date':inbound.date,
              'Customer':inbound.customer,
              'Warehouse':inbound.facilityName,
              'BOL':inbound.bol,
              'ArriveTime':inbound.arrivalTime,
              'ScheduleTime':inbound.schedule,
              'ArriveStatus':inbound.arrival,
              'DepartureTime':inbound.depart,
              'OnSiteTime':inbound.siteTime,
              'CreationDate':inbound.creationDate,
              'Carrier':inbound.carrier,
              'Brand':inbound.brand
            });
          })
        })

      }catch(error){
        return response.status(500).json({
          message: error.message
        });
      }
    }else if(request.query.initDate && request.query.finalDate){
    response.setHeader('Content-disposition', `attachment; filename=InboundReport${request.query.initDate}-${request.query.finalDate}.csv`);
      const answerRange = await inbounds.getInboundByDate(request.query.initDate, request.query.finalDate);
      answerRange.forEach((array) =>{
        array.inbounds.forEach((inbound) =>{
          csvStream.write({
            'ID':inbound.id,
            'Date':inbound.date,
            'Customer':inbound.customer,
            'Warehouse':inbound.facilityName,
            'BOL':inbound.bol,
            'ArriveTime':inbound.arrivalTime,
            'ScheduleTime':inbound.schedule,
            'ArriveStatus':inbound.arrival,
            'DepartureTime':inbound.depart,
            'OnSiteTime':inbound.siteTime,
            'CreationDate':inbound.creationDate,
            'Carrier':inbound.carrier,
            'Brand':inbound.brand
          });
        })
      })
    }else{
      return response.status(500).json({
        message: "No Date input!"
      })
    }
    csvStream.end();
  
});

module.exports = router;
