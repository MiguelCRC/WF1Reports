const db = require("./db");
const helper = require("../helper");
const moment = require("moment");
const e = require("express");

async function getOutboundsByDate(initDate, finalDate) {
  var rows;
  var data;
  var date;
  if (finalDate) {
    rows = await db.query(
      `SELECT bol, scheduledate, sendtodoorts, arrivedts, podsignrequests, departedts, podsigned, facilityName, driverphone FROM schedule INNER JOIN warehouses ON tplfacility = facilityId WHERE scheduledate BETWEEN ${initDate} AND ${finalDate} AND direction='Outbound' AND trucktype = 'FTL'`
    );
    date = initDate + " - " + finalDate;
    data = helper.emptyOrRows(rows);
  } else {
    rows = await db.query(
      `SELECT bol, scheduledate, sendtodoorts, arrivedts, podsignrequests, departedts, podsigned, facilityName, driverphone FROM schedule INNER JOIN warehouses ON tplfacility = facilityId WHERE scheduledate = ${initDate} AND direction='Outbound' AND trucktype = 'FTL'`
    );
    date = initDate;
    data = helper.emptyOrRows(rows);
  }

  data.forEach((outbound) => {
    if (outbound.podsignrequests) {
      var sendtodoor = moment(outbound.sendtodoorts, "LTS").format("LTS");
      var windowTimeSendDoor = moment(outbound.sendtodoorts, "LTS").add(15, "minutes").format("LTS");
      var signedWindowTime = moment(sendtodoor, "LTS").isBetween(moment(outbound.sendtodoorts, "LTS"),moment(windowTimeSendDoor, "LTS"));

      var signedRequest = moment(outbound.podsignrequests, "LTS").format("LTS");

      var departs = moment(outbound.departedts, "LTS").format("LTS");
      var duration = moment.duration(moment(departs, "LTS").diff(moment(signedRequest, "LTS")));
      var formatDuration = Math.floor(duration.asHours()) + "h " + Math.floor(duration.minutes()) + "m ";

      outbound.windowToSign = signedWindowTime;
      outbound.durationTime = formatDuration;
    } else {
      outbound.windowToSign = false;
      outbound.durationTime = "No Calculation";
    }
    outbound.scheduledate = date;
    outbound.sendtodoorts = moment(outbound.sendtodoorts).format("MM/DD/YYYY hh:mm:ss a");
    outbound.arrivedts = moment(outbound.arrivedts).format("MM/DD/YYYY hh:mm:ss a");
    outbound.podsignrequests = moment(outbound.podsignrequests).format("MM/DD/YYYY hh:mm:ss a");
    outbound.departedts = moment(outbound.departedts).format("MM/DD/YYYY hh:mm:ss a");
    outbound.podsigned = moment(outbound.podsigned).format("MM/DD/YYYY hh:mm:ss a");
  });
  return data;
}

module.exports = { getOutboundsByDate };
