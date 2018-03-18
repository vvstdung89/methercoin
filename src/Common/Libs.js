const crypto = require("crypto")
const Web3 = require("web3")
exports = module.exports = {
    generateID: function(size){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < size; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    encryptData: function(str){
        var cipher = crypto.createCipher("aes-256-ctr", process.env["password"])
		var crypted = cipher.update(str,'utf-8','hex')
		crypted += cipher.final('hex');
		return crypted;
    },
    decryptData: function(str){
        var decipher = crypto.createDecipher("aes-256-ctr", process.env["password"])
		var dec = decipher.update(str,'hex','utf-8')
		dec += decipher.final('utf-8');
		return dec;
    },
    convertWei2Coin: function(str){
        const szabo = Web3.utils.fromWei(str,"szabo").split(".")[0]
        return Number(szabo)
    },
    convertCoin2Wei: function(str){
        const coint = Web3.utils.toWei(str,"szabo")
        return Number(coint)
    }
}

//check password for encrypt data
// console.log('Use Password : ' + process.env["password"])
if (!process.env["password"]) {
    console.log("Please provide password in environment parameters!")
    process.exit(-1)
}

process.on('unhandledRejection', r => console.log(r));