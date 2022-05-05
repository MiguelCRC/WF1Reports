var express = require("express");
var router = express.Router();
const csv = require("fast-csv");
const outbounds = require("../services/outbounds");

router.get("/", async function (request, response) {
    if(request.query.date){
      response.setHeader(
        "Content-disposition",
        `attachment; filename=OutboundReport${request.query.date}.csv`
      );
      try {
        csvStream = csv.format({
          headers: [
            "BOL",
            "Date",
            "Send to Door",
            "Arrive date",
            "POD Sign request",
            "Depart date",
            "POD signed",
            "Facility",
            "15 min to sign",
            "Time to Sign",
          ],
          objectMode: true,
        });
        csvStream.pipe(response);
        const answerInvent = await outbounds.getOutboundsByDate(request.query.date);
        console.log(answerInvent)
        answerInvent.forEach((resume) => {
          csvStream.write({
            "BOL": resume.bol,
            "Date": resume.scheduledate,
            "Send to Door": resume.sendtodoorts,
            "Arrive date": resume.arrivedts,
            "POD Sign request": resume.podsignrequests,
            "Depart date": resume.departedts,
            "POD signed": resume.podsigned,
            "Facility": resume.facilityName,
            "15 min to sign": resume.windowToSign,
            "Time to Sign": resume.durationTime,
          });
        });
      } catch (error) {
        return response.status(500).json({
          message: error.message,
        });
      }
    }else if(request.query.initDate && request.query.finalDate){
        response.setHeader(
            "Content-disposition",
            `attachment; filename=OutboundReport${request.query.initDate}--${request.query.finalDate}.csv`
          );
          try {
            csvStream = csv.format({
              headers: [
                "BOL",
                "Date",
                "Send to Door",
                "Arrive date",
                "POD Sign request",
                "Depart date",
                "POD signed",
                "Facility",
                "15 min to sign",
                "Time to Sign",
              ],
              objectMode: true,
            });
            csvStream.pipe(response);
            const answerInvent = await outbounds.getOutboundsByDate(request.query.initDate, request.query.finalDate);
            console.log(answerInvent)
            answerInvent.forEach((resume) => {
              csvStream.write({
                "BOL": resume.bol,
                "Date": resume.scheduledate,
                "Send to Door": resume.sendtodoorts,
                "Arrive date": resume.arrivedts,
                "POD Sign request": resume.podsignrequests,
                "Depart date": resume.departedts,
                "POD signed": resume.podsigned,
                "Facility": resume.facilityName,
                "15 min to sign": resume.windowToSign,
                "Time to Sign": resume.durationTime,
              });
            });
          } catch (error) {
            return response.status(500).json({
              message: error.message,
            });
          }
    }else{
      return response.status(500).json({
        message: "No Date input!",
      });
    }
    csvStream.end();
  });

  module.exports = router;