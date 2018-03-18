const AccountDB = require("../models/account")
const WithdrawDB = require("../models/withdraw")
const EthereumAPI = require("../Ethereum/ethereumAPI")
const MetherAPI = require("../Mether/metherAPI")
const Libs = require("../Common/Libs")

module.exports = {
    createAccount: createAccount,
    withdraw: withdraw,
}

async function withdraw(withdrawAccountID, toAddr, metherValue){
    //write to log
    try {
        const result =  await MetherAPI.sub(withdrawAccountID, metherValue)
        if (result){
            new WithdrawDB({
                accountID: withdrawAccountID,
                to: toAddr,
                value: Libs.convertCoin2Wei(String(metherValue)),
                status: "init"
            })
            .save(async function(err){
                if (err) {
                    console.log(err)
                    await MetherAPI.add(withdrawAccountID, metherValue)
                }
            })
        } else {
            return false
        }
    } catch(err){
        console.log(err)
        return false
    }
    
}

async function createAccount(){
    
    async function checkIDExist(id){
        return new Promise(function(resolve, reject){
            AccountDB.findOne({id: id}, function(err, obj){
                if (err) return reject(new Error("DB Error"))
                resolve(obj ? true : false )
            })
        })
    }
    
    while (true){
        var newID = Libs.generateID(20)
        var isExist = await checkIDExist(newID)
        if (!isExist) {
            break;
        }
    }

    return new Promise(async function(resolve, reject){
        var newEther = await EthereumAPI.createKeypair()
        console.log(newEther.privateKey)
        var newAccount  = new AccountDB({
            id: Libs.generateID(20),
            accessKey: Libs.encryptData(Libs.generateID(15)),
            mether: {
                id: Libs.generateID(40),
                balance: 0
            },
            ether: {
                addr: newEther.address,
                secret: Libs.encryptData(newEther.privateKey)
            }
        })

        newAccount.save(function(err){
            if (err) return resolve()
            return resolve(newAccount)
        })
    })
}

