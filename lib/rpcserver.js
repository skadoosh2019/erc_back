const rpc = require('node-json-rpc');
const cntrctInterface = require('./contractInterface');
const options = {
    // int port of rpc server, default 5080 for http or 5433 for https
    port: process.env.RPC_PORT,
    // string domain name or ip of rpc server, default '127.0.0.1'
    host: process.env.RPC_HOST,
    // string with default path, default '/'
    path: process.env.RPC_PATH,
    // boolean false to turn rpc checks off, default true
    strict: true
};
// Create a server object with options
const server = new rpc.Server(options);

server.addMethod('sendTokens', async function (args, cb) {
    console.log('RPC FUNCTION = sendTokens', args);
    let error, result, cAddress, address, password, to, amount;
    try {
        if (args.length === 5) {
            cAddress = args[0];
            address = args[1];
            password = args[2];
            to = args[3];
            amount = args[4];
            result = await cntrctInterface.sendTokens(cAddress, address, password, to, amount);
            cb(error, result);
        }
        else {
            throw new Error('Invalid Params');
        }
        cb(error, result);
    }
    catch (ex) {
        cb({ code: 'INTERNAL ERROR', message: ex.message });
    }
});
server.addMethod('getMyTokenBalance', async function (args, cb) {
    console.log('RPC FUNCTION = getMyTokenBalance', args);
    let error, result, cAddress, address;
    try {
        if (args.length !== 2) throw new Error('Invalid Params');
        cAddress = args[0];
        address = args[1];
        result = await cntrctInterface.getBalance(cAddress, address);
        cb(error, result);
    }
    catch (ex) {
        cb({ code: 'INTERNAL ERROR', message: ex.message });
    }
});
server.addMethod('createAddressForToken', async function (args, cb) {
    console.log('RPC FUNCTION = createAddressForToken', args);
    let error, result, password;
    try {
        if (args.length !== 1) throw new Error('Invalid Params');
        password = args[0];
        result = await cntrctInterface.createAddress(password);
        cb(error, result);
    }
    catch (ex) {
        cb({ code: 'INTERNAL ERROR', message: ex.message });
    }
});
server.addMethod('personal_newAccount', async function (args, cb) {
    console.log('RPC FUNCTION = personal_newAccount', args);
    let error, result, password;
    try {
        if (args.length !== 1) throw new Error('Invalid Params');
        password = args[0];
        result = await cntrctInterface.createAddress(password);
        cb(error, result);
    }
    catch (ex) {
        cb({ code: 'INTERNAL ERROR', message: ex.message });
    }
});
module.exports = server;