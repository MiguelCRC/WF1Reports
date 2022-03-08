const db = require('./db');
const helper = require('../helper');

async function getInboundByDate(date){
    const rows = await db.query(`select * from schedule where scheduledate = ${date} and direction =  'Inbound'`);
    const data = helper.emptyOrRows(rows)

    return {data}
}

module.exports = {getInboundByDate}