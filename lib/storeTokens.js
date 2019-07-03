const cModel = require('../models/contract');
const cntrctInterface = require('./contractInterface');
const m = require('moment');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
});
const initializeCntrcts = async () => {
    let contracts = await cModel.find().select('address decimals');
    contracts.forEach(async (contract) => {
        console.log('initialized contract ', contract.address)
        let ctx = await cntrctInterface.getCTX(contract.address);
        ctx.events.Transfer()
            .on('data', (event) => {
                console.log('TOKEN RECEIVED = ', event.returnValues.tokens, Math.pow(10, contract.decimals), event.returnValues.tokens / Math.pow(10, contract.decimals))
                let data = {};
                data.blockNumber = event.blockNumber;
                data.contractAddress = contract.address;
                data.transactionHash = event.transactionHash;
                data.fromAddress = event.returnValues.from;
                data.date = m().format('YYYY-MM-DD HH:mm:ss')
                data.amount = event.returnValues.tokens / Math.pow(10, contract.decimals || 18);
                data.toAddress = event.returnValues.to;
                storeTransactions(data).then(console.log).catch(console.log);
            })
            .on('changed', function (event) {
                // remove event from local database
            })
            .on('error', console.error);
    })
};
const storeTransactions = async (data) => {
    let keys = [];
    let values = [];
    let query;
    Object.keys(data).forEach((key) => {
        keys.push('`' + key + '`');
    });
    Object.values(data).forEach((value) => {
        values.push("'" + value + "'");
    });
    connection.query(findQuery(data.toAddress), function (error, res) {
        if (error) console.log('FIND QUERY ERROR = ', error);
        if (res && res.length > 0) {
            connection.query(insetQuery(keys, values), function (error, res) {
                if (error) {
                    console.log('QUERY ERROR = ', error);
                }
                // connected!
                console.log('QUERY EXECUTED ', query, res);
            });
        }
        else {
            console.log("NO RESULTS FOUND");
        }
    })
}
const findQuery = (address) => "SELECT site_user FROM `bitcoin_addresses` WHERE address='" + address + "'";
const insetQuery = (keys, values) => "INSERT INTO `token_txn` (" + keys.join(',') + ") VALUES (" + values.join(",") + ")"
module.exports = { initializeCntrcts };