const AccountDB = require("../models/account")
var semaphoreList = []
module.exports = {
    add: add,
    sub: sub
}

async function add(accountID, value){    
    return new Promise(function(resolve, reject){
        console.log("Add " + value + " to " + accountID)
        AccountDB.findOneAndUpdate({"id": accountID}, {$inc: { "mether.balance": value}}, {new: true}, function(err, obj){
            if (err) return reject()
            resolve(obj)
        })
    })
}

async function sub(accountID, value){    
    return new Promise(function(resolve, reject){
        if (!semaphoreList[accountID])  semaphoreList[accountID] = require("semaphore")(1)
        semaphoreList[accountID].take(function(){
            AccountDB.findOne({"id": accountID}, function(err, obj){
                if (err || !obj || obj.mether.balance < value) {
                    if (err) console.log(err)

                    semaphoreList[accountID].leave()
                    return reject(new Error("Something wrong"))
                }
                AccountDB.findOneAndUpdate({"id": accountID}, {$inc: { "mether.balance": 0-value}}, {new: true}, function(err, obj){
                    if (err){
                        console.log(err)
                        semaphoreList[accountID].leave()
                        return reject(new Error("DB Error"))
                    }
                    semaphoreList[accountID].leave()
                    resolve(obj)
                })
            })
        })
    })


}