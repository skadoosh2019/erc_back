var mongoose = require('mongoose');
// mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var tableSchema = new Schema({
    name: String,
    address: String,
    owner: String,
    symbol: String,
    total_supply: String,
    abi: Schema.Types.Mixed,
    gas: Number,
    gasPrice: Number,
    decimals: Number,
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: Date,
    updated_at: Date
}, {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    });
tableSchema.static('addContracts', async function (data) {
   return await this.find();
});
module.exports = mongoose.model('Contract', tableSchema);