const storeTokens = require(ROOT_FOLDER + '/lib/storeTokens');
const add = async function (req, res, next) {
    try {
        let Contract = req.model('contract');
        let contractObj = req.body;
        contractObj.created_by = req.user._id;
        let isExist = await Contract.count({ address: contractObj.address });
        if (isExist) throw new Error('Contract already exists.')
        let contract = await new Contract(contractObj).save();
        storeTokens.initializeCntrcts();
        res.sendResponse({ contract }, 'Contract added successfully.');
    }
    catch (ex) {
        return next(ex);
    }
};
const update = async (req, res, next) => {
    try {
        let Contract = req.model('contract');
        let contractObj = req.body;
        let { id } = req.params;
        let isExist = await Contract.count({ address: contractObj.address, _id: { $ne: id } });
        if (isExist) throw new Error('Contract already exists.')
        let contract = await Contract.findOneAndUpdate({ _id: id }, contractObj, { new: true });
        storeTokens.initializeCntrcts();
        res.sendResponse({ contract }, 'Contract updated successfully.');
    }
    catch (ex) {
        return next(ex);
    }

};
const getSingle = async (req, res, next) => {
    try {
        let Contract = req.model('contract');
        let { id } = req.params;
        let contract = await Contract.findOne({ _id: id });
        res.sendResponse({ contract }, 'Contract fetched successfully.');
    }
    catch (ex) {
        return next(ex);
    }

};
const getAll = async (req, res, next) => {
    try {
        let Contract = req.model('contract');
        let contract = await Contract.find({});
        res.sendResponse({ contract }, 'Contract fetched successfully.');
    }
    catch (ex) {
        return next(ex);
    }

};
const remove = async (req, res, next) => {
    try {
        let Contract = req.model('contract');
        let { id } = req.params;
        let contract = await Contract.remove({ _id: id });
        storeTokens.initializeCntrcts();
        res.sendResponse({ contract }, 'Contract removed successfully.');
    }
    catch (ex) {
        return next(ex);
    }
};
module.exports = { add, update, getSingle, getAll, remove };