var assert = require('assert');
var exec = require("child_process").exec
const Web3 = require('web3')
var rpc_server = "http://127.0.0.1:8545"
var web3 = new Web3(new Web3.providers.HttpProvider(rpc_server))

async function sendGET(method, data){
    var url = `http://localhost:10000/account/${method}`;
    return new Promise(function(resolve){
        exec(`curl -sf ${url}`, function(err, stdout){
            if (err) console.log(err)
            resolve(stdout || "")
        })
    })
}
describe('MetherCoin', function () {
    var localAccounts = []
    let account1, account2, account3, account4

    before("Get Account", async () => {
        localAccounts  = await web3.eth.getAccounts();
        assert(localAccounts.length>0);
    })

    it("should return account when call createAccount", async () => {
        assert(JSON.parse(await sendGET("createAccount", {})).status == "ok")

        account1 = JSON.parse(await sendGET("createAccount", {})).data;
        account2 = JSON.parse(await sendGET("createAccount", {})).data;
        account3 = JSON.parse(await sendGET("createAccount", {})).data;
        account4 = JSON.parse(await sendGET("createAccount", {})).data;
        console.log(account1)
    })

    it("should update mether balance when deposit ", async () => {
        let tx = await web3.eth.sendTransaction({ to: account1.ether.addr, from: localAccounts[0], value: web3.utils.toWei('20', 'ether') })
        return new Promise(function(resolve){
            setInterval(function(){
                // wait sendGET("getAccount", "")).data
            },1000)
        })

    })
    
});