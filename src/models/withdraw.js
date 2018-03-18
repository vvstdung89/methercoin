var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var WithdrawModel   = new Schema({
    to: {type:String, index: true},
    txid: {type:String, index: true},
    blockNumber: {type:Number, index: true},
    blockHash: {type:String, index: true},
    value: String,
    accountID: {type:String, index: true},
    status: {type:String, index: true}, //init, processing, finish
    processTime: {type:Date, index: true},
});


WithdrawModel.set('autoIndex', true);

const connection = mongoose.createConnection("mongodb://localhost:27017/Mether");
var DBModel = connection.model('WithdrawModel', WithdrawModel);
exports = module.exports = DBModel

