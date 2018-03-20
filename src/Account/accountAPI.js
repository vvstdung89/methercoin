const AccountDB = require("../models/account")
const WithdrawDB = require("../models/withdraw")
const DepositDB = require("../models/deposit")
const EthereumAPI = require("../Ethereum/ethereumAPI")
const MetherAPI = require("../Mether/metherAPI")
const Libs = require("../Common/Libs")

module.exports = {
    getAccount: getAccount,
    getDeposit: getDeposit,
    createAccount: createAccount,
    withdraw: withdraw,
    transfer: transfer,
    getWithdrawFee: getWithdrawFee
}
async function getAccount(id){
    return new Promise(function(resolve){
        AccountDB.findOne({id: id}, function(err, result){
            if (!result) resolve({status: "fail"})
            resolve({status:"ok", data: result})
        })
    })
    
}

function getWithdrawFee(){
    return Libs.withdrawFee()
}

function getDeposit(accountID){
    return new Promise(async function(resolve){
        DepositDB.find({accountID: accountID}, function(err, objs){
            if (err) resolve({status: "fail"})
            resolve({status: "ok", data: objs})
        })
    })
}

async function transfer(fromAccountID, toAccountID, metherValue){
    //write to log
    console.log(fromAccountID, toAccountID, metherValue)
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
    const transferValue = Libs.convertCoin2Wei(String(Math.floor(metherValue - getWithdrawFee())))
    try {
        var logWithdraw = new WithdrawDB({
            to: toAddr,
            value: transferValue,
            accountID: withdrawAccountID,
            status: 0
        })

        await new Promise(function(resolve){
            logWithdraw.save(function(err){
                if (err) reject()
                resolve()
            })
        })
    } catch(err){
        return {status: "fail"}
    }
    
    
    try {
        await MetherAPI.sub(withdrawAccountID, metherValue)
    } catch(err){
        console.log(err)
        WithdrawDB.findOneAndUpdate({_id: logWithdraw._id}, {status: -1}, function(){})
        return {status: "fail"}
    }

    try {
        var tx = await EthereumAPI.transferTo(toAddr, transferValue)
        if (!tx) throw new Error("cannot send transaction")
    } catch(err){
        console.log(err)
        WithdrawDB.findOneAndUpdate({_id: logWithdraw._id}, {status: -1}, function(){})
        await MetherAPI.add(withdrawAccountID, metherValue)
        return {status: "fail"}
    }

    WithdrawDB.findOneAndUpdate({_id: logWithdraw._id}, {
        txid: tx.transactionHash,
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash,
        status: 1
    }, function(){})
    return {status: "ok", data: {txid: tx.transactionHash}}
    
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
            var newAccount  = new AccountDB({
                id: Libs.generateID(20),
                accessKey: Libs.encryptData(Libs.generateID(15)),
                mether: {
                    addr: Libs.generateID(40),
                    balance: 0
                },
                ether: {
                    addr: newEther.address,
                    secret: Libs.encryptData(newEther.privateKey)
                }
            })
    
            newAccount.save(function(err){
                if (err) {
                    console.log(err)
                    return resolve({status: "fail"})
                }
                return resolve({status: "ok", data: {id: newAccount.id, etherAddress: newAccount.ether.addr}})
            })
        })
    } catch(err){
        console.log(err)
        return {status: "fail"}
    }
    
}

