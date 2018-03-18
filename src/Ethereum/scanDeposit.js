const Web3 = require('web3')
const DepositDB = require("../models/deposit")
const AccountDB = require("../models/account")
var rpc_server = "http://localhost:8545"
var web3 = new Web3(new Web3.providers.HttpProvider(rpc_server))
const fs = require("fs")

var processBlock = {}
async function getProcessedBlock(){
    try {
        if (!fs.existsSync(__dirname + "/../../resources/.checkBlock")){
            console.log('write new')
            fs.writeFileSync(__dirname + "/../../resources/.checkBlock","")
            let currentBlock =  Number(await web3.eth.getBlockNumber()) - 3
            fs.writeFileSync(__dirname + "/../../resources/.lastProcess", currentBlock)
        }

        const data = fs.readFileSync(__dirname + "/../../resources/.checkBlock").toString()
        const blockData = data.split("\n")
        for (var i = 0; i < blockData.length; i++ ){
            processBlock[blockData[i][0]] = blockData[i][1]
        }
        
    } catch(err) {        
        console.log(err)
        proceess.exit()
    }
    

}

async function searchBlock(){
    try {
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
        let blockID = Number(fs.readFileSync(__dirname + "/../../resources/.lastProcess").toString())+1
        if (blockID > Number(await web3.eth.getBlockNumber()) - 2) return setTimeout(searchBlock, 60*1000);
        if (processBlock[blockID]) return setTimeout(searchBlock, 60*1000);
    
        console.log("block: " + blockID)
    
        const trans = (await web3.eth.getBlock(blockID)).transactions
        for (var i in trans) {
            var item = trans[i]
            let tx = await web3.eth.getTransaction(item)
            let account = await checkValidAddress(tx.to)
            if (!account) continue;
            console.log(item + " is valid")
            var query = {txid: item}
            var update = {
                accountID: account.id,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                $setOnInsert:{
                    status: "init"
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
    
        fs.appendFileSync(__dirname + "/../../resources/.checkBlock",`${blockID} ${trans.length}\n`)
        fs.writeFileSync(__dirname + "/../../resources/.lastProcess", blockID)
        processBlock[blockID] = trans.length
        searchBlock()

    } catch(err) {        
        console.log(err)
        proceess.exit()
    }
    
}

!async function(){
    await getProcessedBlock()
    searchBlock()
}()
