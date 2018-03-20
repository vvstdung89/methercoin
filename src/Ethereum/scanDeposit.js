const Web3 = require('web3')
const DepositDB = require("../models/deposit")
const AccountDB = require("../models/account")
var rpc_server = "http://localhost:8545"
var web3 = new Web3(new Web3.providers.HttpProvider(rpc_server))
const fs = require("fs")
const validDelayBlock = 30
var processBlock = {}
async function getProcessedBlock(){
    try {
        if (!fs.existsSync(__dirname + "/../../resources/.checkBlock")){
            console.log('write new')
            fs.writeFileSync(__dirname + "/../../resources/.checkBlock","")
            let currentBlock =  Number(await web3.eth.getBlockNumber()) - validDelayBlock
            if (currentBlock < 0) currentBlock = 0
            fs.writeFileSync(__dirname + "/../../resources/.lastProcess", currentBlock)
        }

        const data = fs.readFileSync(__dirname + "/../../resources/.checkBlock").toString()
        const blockData = data.split("\n")
        for (var i = 0; i < blockData.length; i++ ){
            processBlock[blockData[i][0]] = blockData[i][1]
        }
        
    } catch(err) {        
        console.log(err)
        process.exit()
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


async function updateNewTransaction(lastBlock = -1){
    const block = (lastBlock == -1) ? (await web3.eth.getBlock("latest")) : (await web3.eth.getBlock(lastBlock))
    // console.log(block)
    if (!block) {
        return setTimeout(updateNewTransaction, 1000, lastBlock);
    } 

    if (lastBlock==-1){
        lastBlock=block.number++
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
    setTimeout(updateNewTransaction, 1000, lastBlock);
}


async function processValidBlock(){
    try {
        
        let blockID = Number(fs.readFileSync(__dirname + "/../../resources/.lastProcess").toString())+1
        if (blockID > Number(await web3.eth.getBlockNumber()) - validDelayBlock) return setTimeout(processValidBlock, 1000);
        if (processBlock[blockID]) return setTimeout(processValidBlock, 1000);
    
        
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
    
        fs.appendFileSync(__dirname + "/../../resources/.checkBlock",`${blockID} ${trans.length}\n`)
        fs.writeFileSync(__dirname + "/../../resources/.lastProcess", blockID)
        processBlock[blockID] = trans.length
        processValidBlock()
    } catch(err) {        
        console.log(err)
        process.exit()
    }
    
}

!async function(){
    await getProcessedBlock()
    processValidBlock()
    updateNewTransaction()
}()
