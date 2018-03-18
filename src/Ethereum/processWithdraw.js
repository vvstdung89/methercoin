const WithdrawDB = require("../models/withdraw")
const EthereumAPI = require("../Ethereum/ethereumAPI")
const Libs = require("../Common/Libs")

async function process(){
    async function findWithdraw(){
        return new Promise(function(resolve, reject){
            WithdrawDB.findOneAndUpdate({status: "init"}, {status: "processed", processTime: new Date()}, async function(err, obj){
                try {
                    if (err) return reject(err)
                    if (!obj) return resolve()
                    const tx = await EthereumAPI.transferTo(obj.to, obj.value)
                    if (tx){
                        //what if write to database fail, at this stage?
                        WithdrawDB.findOneAndUpdate({_id: obj._id}, {blockNumber: tx.blockNumber, blockHash: tx.blockHash, txid: tx.transactionHash}, function(err){
                            if (err) console.log(err)
                        })
                        return resolve(tx)
                    } else {
                        return reject(new Error("Cannot send transaction"))
                    }
                } catch(err) {
                    console.log(err)
                    reject(err)
                }
            })
        })
    }

    async function timeout(n){
        return new Promise(function(resolve){
            setTimeout(function(){
                resolve()
            }, n)
        })
    }

    while(true){
        try {
            let result = await findWithdraw()
            if (!result) {
                await timeout(1000)
            } 
        } catch (err){
            console.log(err)
        }
    }
    
}

process()