const DepositDB = require("../models/deposit")
const MetherCoin = require("../Mether/metherAPI")
const Libs = require("../Common/Libs")

async function process(){
    async function findDeposit(){
        return new Promise(function(resolve, reject){
            DepositDB.findOneAndUpdate({status: "init"}, {status: "processed", processTime: new Date()}, async function(err, obj){
                try {
                    if (err) return reject(err)
                    if (!obj) return resolve()
                    const a = await MetherCoin.add(obj.accountID, Libs.convertWei2Coin(obj.value))
                    return resolve(a)
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
            let result = await findDeposit()
            if (!result) {
                await timeout(1000)
            } 
        } catch (err){
            console.log(err)
        }
    }
    
}

process()