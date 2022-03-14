const db = require("./db");
const helper = require("../helper");
const moment = require("moment");
const e = require("express");

async function getInboundByDate(initDate, finalDate) {
    var rows;
    var data;
    if (finalDate) {
        rows = await db.query(
            `select * from schedule inner Join warehouses on tplfacility = facilityId where direction =  'Inbound' and scheduledate Between ${initDate} and ${finalDate}`
        );
        data = helper.emptyOrRows(rows);
    } else {
        rows = await db.query(
            `select * from schedule inner Join warehouses on tplfacility = facilityId where direction =  'Inbound' and scheduledate = ${initDate}`
        );
        data = helper.emptyOrRows(rows);

    }

    var preparedData = [];
    var structuredInbound;
    var structurePendingInbounds;
    var finalInbounds = [];
    var finalPending = [];

    var status;
    var arrive;
    var depart;
    var schedule;
    var date;
    var scheduleWindowLate;
    var scheduleWindowEarly;
    var differenceTimeLate;
    var differenceTimeEarly;
    var earlyIsBefore;


    data.forEach((inbound) => {
        depart = moment(inbound.departedts).format("LTS");
        date = moment(inbound.scheduledate).format("YYYY-MM-DD");

        if (inbound.currentstate == "COMPLETE") {
            if (inbound.arrivedts) {
                arrive = moment(inbound.arrivedts).format("LTS");
                schedule = moment(inbound.scheduletime, "LTS").format("LTS");

                scheduleWindowLate = moment(schedule, "LTS")
                    .add(30, "minutes")
                    .format("LTS");
                scheduleWindowEarly = moment(schedule, "LTS")
                    .subtract(30, "minutes")
                    .format("LTS");

                differenceTimeLate = moment(arrive, "LTS").isBetween(
                    moment(schedule, "LTS"),
                    moment(scheduleWindowLate, "LTS")
                );
                differenceTimeEarly = moment(arrive, "LTS").isBetween(
                    moment(scheduleWindowEarly, "LTS"),
                    moment(schedule, "LTS")
                );
                earlyIsBefore = moment(arrive, "LTS").isBefore(moment(schedule, "LTS"));

                if (
                    differenceTimeLate == true &&
                    differenceTimeEarly == false &&
                    earlyIsBefore == false
                ) {
                    status = "OnTime";
                } else if (
                    differenceTimeLate == false &&
                    differenceTimeEarly == true &&
                    earlyIsBefore == false
                ) {
                    status = "Early";
                } else if (
                    differenceTimeLate == true &&
                    differenceTimeEarly == true &&
                    earlyIsBefore == false
                ) {
                    status = "OnTime";
                } else if (
                    differenceTimeLate == false &&
                    differenceTimeEarly == false &&
                    earlyIsBefore == true
                ) {
                    status = "Early";
                } else if (
                    differenceTimeLate == false &&
                    differenceTimeEarly == false &&
                    earlyIsBefore == false
                ) {
                    status = "Late";
                }
            } else if (inbound.arrivedts == null) {
                status = "No Show";
            }

            var duration = moment.duration(moment(inbound.departedts).diff(moment(inbound.arrivedts)));
            var formatDuration = Math.floor(duration.asHours()) + 'h ' + Math.floor(duration.minutes()) + 'm ';

            structuredInbound = {
                id: inbound.id,
                date: date,
                customer: inbound.customer,
                facilityName: inbound.facilityName || null,
                bol: inbound.bol,
                arrivalTime: arrive || null,
                schedule: schedule || null,
                arrival: status,
                depart: depart || null,
                siteTime: formatDuration,
                creationDate: inbound.creationDate,
                carrier: inbound.carrier,
                brand: inbound.brand,
            };
            finalInbounds.push(structuredInbound);
        } else if (inbound.currentstate == "SCHEDULED") {
            structurePendingInbounds = {
                id: inbound.id,
                date: inbound.scheduledate,
                customer: inbound.customer,
                facilityName: inbound.facilityName,
                bol: inbound.bol,
            }
            finalPending.push(structurePendingInbounds);
        }
    });
    preparedData.push({ inbounds: finalInbounds }, { pending: finalPending });
    return preparedData;
}

module.exports = { getInboundByDate };
