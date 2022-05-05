const db = require("./db");
const helper = require("../helper");
const moment = require("moment");
const e = require("express");

async function getInboundByDate(initDate, finalDate) {
  var rows;
  var data;
  var warehouses;
  var wData;
  var date;

  if (finalDate) {
    rows = await db.query(
      `select * from schedule inner Join warehouses on tplfacility = facilityId where scheduledate Between ${initDate} and ${finalDate} order by facilityid`
    );
    date = initDate + " - " + finalDate;
    data = helper.emptyOrRows(rows);
  } else {
    rows = await db.query(
      `select * from schedule inner Join warehouses on tplfacility = facilityId where scheduledate = ${initDate} order by facilityid`
    );
    date = initDate;
    data = helper.emptyOrRows(rows);
  }

  warehouses = await db.query(`select facilityName from warehouses`)
  wData = helper.emptyOrRows(warehouses);

  var preparedData = [];
  var byWarehouse = {};

  wData.forEach((warehouse) =>{
    var location = warehouse.facilityName;
    var arrive;
    var schedule;
    var status = ""; 

    var totalScheduledDriver = 0;
    var totalOnTimeDriver = 0;
    var totalEarlyDriver = 0; 
    var totalLateDriver = 0;
    var totalNoShowDriver = 0;
    var loadLateDriver = "";
    var loadNoShowDriver = " ";
    var scheduleWindowLateDriver;
    var scheduleWindowEarlyDriver;
    var differenceTimeLateDriver;
    var differenceTimeEarlyDriver;
    var earlyIsBeforeDriver;

    var dirverAtDoor;
    var totalOnTimeWarehouse = 0;
    var scheduleWindowOnTimeWarehouse;
    var sendToDoorTime;
    var differenceTimeOnTimeWarehouse;

    var lessDwellAvg = 0.0;
    var moreDwellAvg = 0.0;
    var lessTimeDwell = 0;
    var moreTimeDwell = 0;
    var loadMoreTimeDwell = "";
    
    var noneSendToDoor = 0;
    var dateTimeSchedule;
    var toDoorDifference;
    var windowTimeSendDoor;
    var toDoorEarly = 0;
    var toDoorEarlyBol = "";
    var toDoorEarlyTime = 0.00;
    var toDoorEarlyAvg = 0.00;
    var toDoorOnTime = 0;
    var toDoorOnTimeBol = "";
    var toDoorOnTimeTime = 0.00;
    var toDoorOnTimeAvg = 0.00;

    data.forEach((inbound) =>{
      if(warehouse.facilityName === inbound.facilityName){
        if(inbound.currentstate === "COMPLETE"){
          totalScheduledDriver++;
        }
        if (inbound.arrivedts) {
          arrive = moment(inbound.arrivedts).format("LTS");
          schedule = moment(inbound.scheduletime, "LTS").format("LTS");
    
          scheduleWindowLateDriver = moment(schedule, "LTS").add(30, "minutes").format("LTS");
          scheduleWindowEarlyDriver = moment(schedule, "LTS").subtract(30, "minutes").format("LTS");
    
          differenceTimeLateDriver = moment(arrive, "LTS").isBetween(moment(schedule, "LTS"),moment(scheduleWindowLateDriver, "LTS"));
          differenceTimeEarlyDriver = moment(arrive, "LTS").isBetween(moment(scheduleWindowEarlyDriver, "LTS"),moment(schedule, "LTS"));
          earlyIsBeforeDriver = moment(arrive, "LTS").isBefore(moment(schedule, "LTS"));

          sendToDoorTime = moment(inbound.sendtodoorts, "LTS").format("LTS");

          if (differenceTimeLateDriver == true && differenceTimeEarlyDriver == false && earlyIsBeforeDriver == false) {
            totalOnTimeDriver++;
            scheduleWindowOnTimeWarehouse = moment(arrive, "LTS").add(30, "minutes").format("LTS");
            differenceTimeOnTimeWarehouse = moment(sendToDoorTime, "LTS").isBetween(moment(arrive, "LTS"),moment(scheduleWindowOnTimeWarehouse, "LTS"));
            if(differenceTimeOnTimeWarehouse){
              totalOnTimeWarehouse++;
            }
            status = "OnTime";
          } else if (differenceTimeLateDriver == false && differenceTimeEarlyDriver == true && earlyIsBeforeDriver == false) {
            totalEarlyDriver++;
            status = "Early";
          } else if (differenceTimeLateDriver == true && differenceTimeEarlyDriver == true && earlyIsBeforeDriver == false) {
            totalOnTimeDriver++;
            scheduleWindowOnTimeWarehouse = moment(arrive, "LTS").add(30, "minutes").format("LTS");
            differenceTimeOnTimeWarehouse = moment(sendToDoorTime, "LTS").isBetween(moment(arrive, "LTS"),moment(scheduleWindowOnTimeWarehouse, "LTS"));
            if(differenceTimeOnTimeWarehouse){
              totalOnTimeWarehouse++;
            }
            status = "OnTime";
          } else if (differenceTimeLateDriver == false && differenceTimeEarlyDriver == false && earlyIsBeforeDriver == true) {
            totalEarlyDriver++;
            status = "Early";
          } else if (differenceTimeLateDriver == false && differenceTimeEarlyDriver == false && earlyIsBeforeDriver == false) {
            totalLateDriver++;
            loadLateDriver = loadLateDriver + "," + inbound.bol;
            status = "Late";
          }
          duration = moment.duration(moment(inbound.departedts).diff(moment(inbound.arrivedts)));
          formatDuration = Math.floor(duration.asHours()) + "h " + Math.floor(duration.minutes()) + "m ";
          
          if(duration.asHours() < 2){
            lessTimeDwell++;
            
          }else if(duration.asHours() > 2){
            moreTimeDwell++;
            loadMoreTimeDwell = loadMoreTimeDwell + "," + inbound.bol;
            if(inbound.sendtodoorts){
              if ( status === "Early" ){
                  dateTimeSchedule = moment(inbound.sendtodoorts).set('hour',moment(schedule,"LTS").get('hour'));
                  dateTimeSchedule = moment(dateTimeSchedule).set('minutes',moment(schedule,"LTS").get('minutes'));
                  dateTimeSchedule = moment(dateTimeSchedule).set('seconds',moment(schedule,"LTS").get('seconds'));

                  windowTimeSendDoor =  moment(dateTimeSchedule).add(10, "minutes");

                  if(moment(inbound.sendtodoorts).isBefore(moment(dateTimeSchedule))){
                    toDoorEarly++;
                    toDoorEarlyBol = toDoorEarlyBol + "," + inbound.bol;
                    toDoorEarlyTime = toDoorEarlyTime + moment.duration(moment(inbound.sendtodoorts).diff(moment(inbound.arrivedts))).asMinutes();
                  }else{

                  }
                  toDoorDifference = moment(inbound.sendtodoorts, "LTS").isBetween(moment(schedule, "LTS"),moment(windowTimeSendDoor, "LTS"));
                  console.log(moment(windowTimeSendDoor).format("LTS"),"window");
                  console.log(moment(inbound.sendtodoorts).format("LTS"),"sentodoor");
                  console.log(moment(inbound.arrivedts).format("LTS"),"arrive");
                  

                  // formatDoorDuration = Math.floor(toDoorDuration.asHours()) + "h " + Math.floor(toDoorDuration.minutes()) + "m ";
                  // console.log(formatDoorDuration);

                
              }else if(status === "OnTime"){

              }
            }else{
              noneSendToDoor++;
            }
          }
        } else if (inbound.arrivedts == null) {
          totalNoShowDriver++;
          loadNoShowDriver = loadNoShowDriver + "," + inbound.bol;
          status = "No Show";
          formatDuration = null;
          depart = null;
        }
      }
    });

    if(lessTimeDwell !== 0){
      lessDwellAvg = ((lessTimeDwell / totalScheduledDriver) * 100).toFixed(2);
    } 
    if(moreTimeDwell !== 0){
      moreDwellAvg = ((moreTimeDwell / totalScheduledDriver) * 100).toFixed(2);
    }
    if(toDoorEarlyTime !== 0){
      toDoorEarlyAvg = (toDoorEarlyTime / toDoorEarly).toFixed(2);
    }

    byWarehouse = {
      location: location,
      date: date,
      totalScheduleDriver: totalScheduledDriver,
      totalEarlyDriver: totalEarlyDriver,
      totalOnTimeDriver: totalOnTimeDriver,
      totalLateDriver: totalLateDriver,
      loadLateDriver: loadLateDriver,
      totalNoShowDriver: totalNoShowDriver,
      loadNoShowDriver: loadNoShowDriver,
      totalOnTimeWarehouse: totalOnTimeWarehouse,
      lessDwellAvg: lessDwellAvg,
      moreDwellAvg: moreDwellAvg,
      lessTimeDwell: lessTimeDwell,
      moreTimeDwell: moreTimeDwell,
      loadMoreTimeDwell: loadMoreTimeDwell,
      noSendToDoor: noneSendToDoor,
      totalToDoorEarly: toDoorEarly,
      loadToDoorEarly: toDoorEarlyBol,
      toDoorEarlyMessageAvg: toDoorEarlyAvg,
      totalToDoorOnTime: toDoorOnTime,
      loadToDoorOnTime: toDoorOnTimeBol,
      toDoorOnTimeMessageAvg: toDoorOnTimeAvg,
    }
    preparedData.push(byWarehouse);

  });
  console.log(preparedData)
  return preparedData;
}

module.exports = { getInboundByDate };
