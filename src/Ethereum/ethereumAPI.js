const Web3 = require('web3')
var rpc_server = "http://127.0.0.1:8545"
var web3 = new Web3(new Web3.providers.HttpProvider(rpc_server))
var crypto = require('crypto'),

exports = module.exports = {
    createKeypair: async function(){
        var newAccount = await web3.eth.accounts.create()
        return newAccount
    }, 
    getRootAccount: async function(){
        var localKeys = await web3.eth.getAccounts()
        return localKeys[0]
    },
    transferTo: transferTo
}

async function transferTo(toAddr, value){
    var localKeys = await web3.eth.getAccounts()
    var personalAccount = localKeys[0]  
    const tx = await web3.eth.sendTransaction({to: toAddr, from: personalAccount, value: value })
    
    return tx
    
}
async function start(){
    var localKeys = await web3.eth.getAccounts()
    console.log('Local accounts : ' + localKeys.length)

    if (localKeys.length==0) {
        console.log("There must be one key in local")
        process.exit(-1)
    }

    for (var i = 0; i < localKeys.length; i++){
        console.log(localKeys[i] + " : "  + web3.utils.fromWei(await getBalance(localKeys[i]), 'ether') + " ether" )
    }

//     // console.log(web3.utils.toWei("15999999996215800010","wei"))
//     var accs = await web3.eth.getAccounts()
    var personalAccount = localKeys[0]
//     // await getBalance(personalAccount)
    var newAccount = await web3.eth.accounts.privateKeyToAccount("0x488b6059f14542865ec1fb91c2b38c713a3f1d7a88a41e70f94ee891e393dcce")
    console.log(newAccount)
    await web3.eth.sendTransaction({to: newAccount.address, from: personalAccount, value: web3.utils.toWei('20', 'ether') })

    await getBalance(newAccount.address)
    
//     // var rawTx = {
//     //     gas: 21000, 
//     //     gasPrice: 21000,
//     //     to: personalAccount,
//     //     value: web3.utils.toWei('1', 'ether'),
//     //     nonce: await web3.eth.getTransactionCount(newAccount.address),
//     //     chainId: await web3.shh.net.getId()
//     // }

//     // console.log(rawTx)


//     // const sign = await  newAccount.signTransaction(rawTx)
//     // var sign = await web3.eth.accounts.signTransaction(rawTx, newAccount.privateKey)

//     // web3.eth.sendSignedTransaction(sign.rawTransaction)
//     // .on('receipt', function(receipt){
//     //     // console.log(receipt)
//     //     // getBalance(personalAccount)
//     //     getBalance(newAccount.address)
//     // })

   


}

async function getBalance(addr){
    return await web3.eth.getBalance(addr);
}

start()