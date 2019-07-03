const cModel = require('../models/contract');
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || process.env.WEB3_PROVIDER);
web3._provider.on('end', (eventObj) => {
    console.log('Disconnected: WEB3 ');
    console.log(Object.keys(eventObj));
});
const getCTX = async (address) => {
    if (!address) throw new Error('Contract address is required.');
    let cObj = await cModel.findOne({ address });
    if (cObj === null) throw new Error('Contract not found.');
    let ABI = typeof cObj.abi === 'string' ? JSON.parse(cObj.abi) : cObj.abi;
    try {
        let ctx = new web3.eth.Contract(ABI, cObj.address, {
            from: cObj.owner,
            gasPrice: cObj.gasPrice || process.env.GAS_PRICE,
            gas: cObj.gas || process.env.GAS
        });
        return ctx;
    }
    catch (ex) {
        console.log(ex);
        throw ex;
    }
};
const sendTokens = async (cAddress, address, password, to, amount) => {
    try {
        const ctx = await getCTX(cAddress);
        ctx.options.from = address;
	const gasAmount =  await ctx.methods.transfer(to, web3.utils.toHex(1000000000000000000 * amount)).estimateGas();
        ctx.options.gas = gasAmount;
	await web3.eth.personal.unlockAccount(address, password, web3.utils.toHex(100))
        //let transafer = await ctx.methods.transfer(to, 1000000000000000000 * amount).send();
        //await web3.eth.personal.lockAccount(address, password);
        let transfer = await new Promise((rs, rj) => {
            ctx.methods.transfer(to, web3.utils.toHex(1000000000000000000 * amount)).send()
                .on('transactionHash', (txHash) => {
                    rs({ txHash });
                })
                .on('receipt', console.log)
                .on('confirmation', console.log)
                .on('error', console.error);
        });
        console.log("SEND TOKENS-----Function is completed");
        // await web3.eth.personal.lockAccount(address, password);
        
	return transfer;
    }
    catch (ex) {
        console.log(ex);
        throw new Error(ex);
    }
};
const createAddress = async (password) => {
    try {
        return await web3.eth.personal.newAccount(password)
    }
    catch (ex) {
        console.log(ex);
        throw ex;
    }
}
const getBalance = async (cAddress, address) => {
    try {
        const ctx = await getCTX(cAddress);
        console.log('ADDRESS = ', address);
        const result = await ctx.methods.balanceOf(address).call();
        console.log('CONTRACT BALANCE = ', result);
        return result;
    }
    catch (ex) {
        console.log(ex);
        throw ex;
    }
};
// web3.eth
//     .subscribe('newBlockHeaders', function (error, result) {
//         if (error)
//             console.log(error);
//     })
//     .on("data", function (blockHeader) {
//         console.log('BLOCK ADDED = ', blockHeader.number);
//         var blockNumber = blockHeader.number;
//         web3.eth.getBlock(blockNumber, true, function (error, result) {
//             result.transactions && result.transactions.forEach((item) => {

//                 if (
//                     (item.from && item.from.toLowerCase() === '0x1FcfdA895Dc04fa9790ECf241AC2a0F9623A2125'.toLowerCase()) ||
//                     (item.to && item.to.toLowerCase() === '0x3D4D03d4d09d39Ace91C78b829397FdD03701D77'.toLowerCase())
//                 ) {

//                     console.log('FROM = ', item.from);
//                     console.log('TO = ', item.to);
//                     console.log(abiDecoder.decodeMethod(item.input));
//                     console.log('ITEM = ', item)
//                 }
//             })

//         });
//     });
module.exports = { getCTX, sendTokens, getBalance, createAddress };
