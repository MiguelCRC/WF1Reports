const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getInboundByDate(date){
    const rows = await db.query(`select * from schedule where scheduledate = ${date}`);
    const data = helper.emptyOrRows(rows)

    return {data}
}

module.exports = inbounds