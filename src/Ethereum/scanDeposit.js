const Web3 = require('web3')
const DepositDB = require("../models/deposit")
const AccountDB = require("../models/account")
var rpc_server = "http://localhost:8545"
var web3 = new Web3(new Web3.providers.HttpProvider(rpc_server))
const fs = require("fs")

const validDelayBlock = 30
var processBlock = {}

async function getProcessedBlock(){
    
    if (!fs.existsSync(__dirname + "/../../resources/.lastProcess")){
        throw new Error("Last process block is not exists")    
    }     

}

async function checkValidAddress(addr){
    return new Promise(function(resolve, reject){
        AccountDB.findOne({"ether.addr": addr}, function(err, obj){
            if (err) {
                console.log(err)
                return reject(new Error("DB Error"))
            }
            if (obj) return resolve(obj)
            else resolve(false)
        })
    })
}

async function checkDatabaseValid(){
    return new Promise(function(resolve, reject){
        DepositDB.count({}, function(err, count){
            if (count) return resolve(count)
        })
    })
}

async function updateNewTransaction(lastBlock = -1){
    try {
        const block = (lastBlock == -1) ? (await web3.eth.getBlock("latest")) : (await web3.eth.getBlock(lastBlock))

        if (!block) {
            return setTimeout(updateNewTransaction, 1000, lastBlock);
        } 

        if (lastBlock==-1){
            lastBlock= (block.number - validDelayBlock < 0) ? 0 : (block.number - validDelayBlock)
        } else {
            lastBlock++
        }
        
        const trans = block.transactions
        for (var i in trans) {
            var item = trans[i]
            let tx = await web3.eth.getTransaction(item)
            let account = await checkValidAddress(tx.to)
            // console.log("check " + tx.to, account ? true : false)

            if (!account) continue;

            var query = {txid: item}
            var update = {
                accountID: account.id,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                $setOnInsert:{
                    status: "pending"
                }
            }
            
            await new Promise(function(resolve, reject){
                DepositDB.findOneAndUpdate(query, update, {upsert: true}, function(err){
                    if (err) {
                        console.log(err)
                        reject(new Error("DB Error"))
                        return
                    }
                    resolve()
                })
            })
        }
        updateNewTransaction(lastBlock);

    } catch(err){
        console.log(err)
        process.exit(-1)
    }
    
}


async function processValidBlock(){
    try {
        
        let blockID = Number(fs.readFileSync(__dirname + "/../../resources/.lastProcess").toString())+1
        if (blockID > Number(await web3.eth.getBlockNumber()) - validDelayBlock) return setTimeout(processValidBlock, 1000);
            
        const trans = (await web3.eth.getBlock(blockID)).transactions
        console.log("block: " + blockID, trans)
        for (var i in trans) {
            var item = trans[i]
            let tx = await web3.eth.getTransaction(item)
            let account = await checkValidAddress(tx.to)
            if (!account) continue;
            console.log(item + " is valid " + tx.from + " " + tx.to + " " + tx.value)
            var query = {txid: item, status: {$ne: "processed"} }
            var update = {
                accountID: account.id,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                status: "processing"
            }
            await new Promise(function(resolve, reject){
                DepositDB.findOneAndUpdate(query, update, {upsert: true}, function(err){
                    if (err) {
                        console.log(err)
                        reject(new Error("DB Error"))
                        return
                    }
                    resolve()
                })
            })
        }
        fs.writeFileSync(__dirname + "/../../resources/.lastProcess", blockID)
        processValidBlock()
    } catch(err) {        
        console.log(err)
        process.exit()
    }
    
}

!async function(){
    try {
        var isValid = await checkDatabaseValid() > 0 ? true : false
        if (!isValid)
            throw new Error("database is empty!")
        await getProcessedBlock()
        processValidBlock()
        updateNewTransaction()

    } catch(err){
        console.log(err)
    }

    
}()
