var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AccountModel   = new Schema({
    id: {type:String, unique: true, index: true},
    accessKey: {type:String, unique: true, index: true},

    mether: { //for send and receive
        addr: {type:String, unique: true, index: true},
        balance: Number
    },

    ether: { //only for receive
        addr: {type: String, unique: true, index: true},
        secret: {type: String, unique: true, index: true},
        balance: String,
    },
});

AccountModel.set('autoIndex', true);

const connection = mongoose.createConnection("mongodb://localhost:27017/Mether");
var DBModel = connection.model('AccountModel', AccountModel);
exports = module.exports = DBModel

