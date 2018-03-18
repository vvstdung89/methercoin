var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DepositModel   = new Schema({
    to: {type:String, index: true},
    from: {type:String, index: true},
    txid: {type:String, unique: true, index: true},
    value: String,
    accountID: {type:String, index: true},
    status: {type:String, index: true}, //init, processing, finish
    processTime: {type:Date, index: true},
});


DepositModel.set('autoIndex', true);

const connection = mongoose.createConnection("mongodb://localhost:27017/Mether");
var DBModel = connection.model('DepositModel', DepositModel);
exports = module.exports = DBModel

