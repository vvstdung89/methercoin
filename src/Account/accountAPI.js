const AccountDB = require("../models/account")
const WithdrawDB = require("../models/withdraw")
const EthereumAPI = require("../Ethereum/ethereumAPI")
const MetherAPI = require("../Mether/metherAPI")
const Libs = require("../Common/Libs")

module.exports = {
    createAccount: createAccount,
    withdraw: withdraw,
    transfer: transfer,
    getWithdrawFee: getWithdrawFee
}

function getWithdrawFee(){
    return Libs.withdrawFee()
}

async function transfer(fromAccountID, toAccountID, metherValue){
    //write to log
    try {
        await MetherAPI.sub(fromAccountID, metherValue) 
    } catch(err){
        console.log(err)
        return {status: "fail"}
    }

    try {
        await MetherAPI.add(toAccountID, metherValue)
        return {status: "ok"}
    } catch(err){
        console.log(err)
        await MetherAPI.add(fromAccountID, metherValue) 
        return {status: "fail"}
    }
}

async function withdraw(withdrawAccountID, toAddr, metherValue){
    //write to log
    try {
        await MetherAPI.sub(withdrawAccountID, metherValue)
    } catch(err){
        console.log(err)
        return {status: "fail"}
    }

    try {
        const transferValue = Libs.convertCoin2Wei(String(Math.floor(metherValue - getWithdrawFee())))
        const tx = await EthereumAPI.transferTo(toAddr, transferValue)
        if (!tx) throw new Error("cannot send transaction")
    } catch(err){
        console.log(err)
        await MetherAPI.add(withdrawAccountID, metherValue)
        return {status: "fail"}
    }

    new WithdrawDB({
        to: toAddr,
        txid: tx.transactionHash,
        blockNumber: tx.blockHash,
        blockHash: tx.blockHash,
        value: transferValue,
        accountID: withdrawAccountID,
        status: 0
    }).save(function(){
    })

    return {status: "ok", txid: tx.transactionHash}
    
}

async function createAccount(){
    try {
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
                if (err) return resolve({status: "fail"})
                return resolve({status: "ok", newAccount: newAccount})
            })
        })
    } catch(err){
        return {status: "fail"}
    }
    
}

