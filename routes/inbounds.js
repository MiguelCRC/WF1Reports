var express = require("express");
var router = express.Router();
const csv = require("fast-csv");
const inbounds = require("../services/inbounds");

router.get("/", async function (request, response) {
  response.setHeader("content-type", "text/csv");
  var csvStream;
  if (request.query.date) {
    response.setHeader(
      "Content-disposition",
      `attachment; filename=InboundReport${request.query.date}.csv`
    );
    try {
      csvStream = csv.format({
        headers: [
          "Warehouse Location",
          "Date",
          "Total # Scheduled Driver",
          "Total # Early Driver",
          "Total # On Time Driver",
          "Total # Late Driver",
          "BOL Late Driver",
          "Total # No Show Driver",
          "BOL No Show Driver",
          "Total On Time Warehouse",
          "Dwell Time < 2hrs",
          "Dwell Time > 2hrs",
          "BOL Dwell Time > 2hrs",
          "Dwell Average Time < 2hrs",
          "Dwell Average Time > 2hrs",
        ],
        objectMode: true,
      });
      csvStream.pipe(response);
      const answer = await inbounds.getInboundByDate(request.query.date);
      answer.forEach((resume) => {
        csvStream.write({
          "Warehouse Location": resume.location,
          "Date": resume.date,
          "Total # Scheduled Driver": resume.totalScheduleDriver,
          "Total # Early Driver": resume.totalEarlyDriver,
          "Total # On Time Driver": resume.totalOnTimeDriver,
          "Total # Late Driver": resume.totalLateDriver,
          "BOL Late Driver": resume.loadLateDriver,
          "Total # No Show Driver": resume.totalNoShowDriver,
          "BOL No Show Driver": resume.loadNoShowDriver,
          "Total On Time Warehouse": resume.totalOnTimeWarehouse,
          "Dwell Time < 2hrs": resume.lessTimeDwell,
          "Dwell Time > 2hrs": resume.moreTimeDwell,
          "BOL Dwell Time > 2hrs": resume.loadMoreTimeDwell,
          "Dwell Average Time < 2hrs": resume.lessDwellAvg,
          "Dwell Average Time > 2hrs": resume.moreDwellAvg,
        });
      });
    } catch (error) {
      return response.status(500).json({
        message: error.message,
      });
    }
  } else if (request.query.initDate && request.query.finalDate) {
    response.setHeader(
      "Content-disposition",
      `attachment; filename=InboundReport${request.query.initDate}-${request.query.finalDate}.csv`
    );
    csvStream = csv.format({
      headers: [
        "Warehouse Location",
        "Range Date",
        "Total # Scheduled Driver",
        "Total # Early Driver",
        "Total # On Time Driver",
        "Total # Late Driver",
        "BOL Late Driver",
        "Total # No Show Driver",
        "BOL No Show Driver",
        "Total On Time Warehouse",
        "Dwell Time < 2hrs",
        "Dwell Time > 2hrs",
        "BOL Dwell Time > 2hrs",
        "Dwell Average Time < 2hrs",
        "Dwell Average Time > 2hrs",
      ],
      objectMode: true,
    });
    csvStream.pipe(response);
    const answerRange = await inbounds.getInboundByDate(
      request.query.initDate,
      request.query.finalDate
    );
    answerRange.forEach((resume) => {
      csvStream.write({
        "Warehouse Location": resume.location,
        "Range Date": resume.date,
        "Total # Scheduled Driver": resume.totalScheduleDriver,
        "Total # Early Driver": resume.totalEarlyDriver,
        "Total # On Time Driver": resume.totalOnTimeDriver,
        "Total # Late Driver": resume.totalLateDriver,
        "BOL Late Driver": resume.loadLateDriver,
        "Total # No Show Driver": resume.totalNoShowDriver,
        "BOL No Show Driver": resume.loadNoShowDriver,
        "Total On Time Warehouse": resume.totalOnTimeWarehouse,
        "Dwell Time < 2hrs": resume.lessTimeDwell,
        "Dwell Time > 2hrs": resume.moreTimeDwell,
        "BOL Dwell Time > 2hrs": resume.loadMoreTimeDwell,
        "Dwell Average Time < 2hrs": resume.lessDwellAverage,
        "Dwell Average Time > 2hrs": resume.moreDwellAvg,
      });
    });
  } else {
    return response.status(500).json({
      message: "No Date input!",
    });
  }
  csvStream.end();
});

module.exports = router;
