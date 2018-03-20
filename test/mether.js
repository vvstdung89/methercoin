var assert = require('assert');
var exec = require("child_process").exec
const Web3 = require('web3')
var rpc_server = "http://127.0.0.1:8545"
var web3 = new Web3(new Web3.providers.HttpProvider(rpc_server))

async function sendGET(method, data){
    const querystring = require("querystring")
    
    var url = `http://localhost:10000/account/${method}?${querystring.stringify(data||"")}`;
    // console.log(url)
    return new Promise(function(resolve){
        exec(`curl -sf "${url}"`, function(err, stdout){
            if (err) console.log(err)
            resolve(stdout || "")
        })
    })
}


async function timeout(s){
    return new Promise(function(resolve){
        setTimeout(resolve, s)
    })
}
describe('MetherCoin', function () {
    var localAccounts = []
    let account1, account2, account3, account4

    before("Get Account", async () => {
        localAccounts  = await web3.eth.getAccounts();
        assert(localAccounts.length>0);
    })

    describe("At the beginning", function(){
        it("should return account when call createAccount", async () => {
            assert(JSON.parse(await sendGET("createAccount", {})).status == "ok")
        })

        it("should return account when call getAccount", async () => {
            account1 = JSON.parse(await sendGET("createAccount", {})).data;
            assert(JSON.parse(await sendGET("getAccount", {id: account1.id})).status == "ok")
        })

    })
    
    describe("When running", function(){

        beforeEach("Create Account", async () => {
            account1 = JSON.parse(await sendGET("createAccount", {})).data;
            account2 = JSON.parse(await sendGET("createAccount", {})).data;
            account3 = JSON.parse(await sendGET("createAccount", {})).data;
            account4 = JSON.parse(await sendGET("createAccount", {})).data;
            account5 = JSON.parse(await sendGET("createAccount", {})).data;
            await web3.eth.sendTransaction({ to: account1.etherAddress, from: localAccounts[0], value: web3.utils.toWei('10', 'ether') })
            await web3.eth.sendTransaction({ to: account2.etherAddress, from: localAccounts[1], value: web3.utils.toWei('10', 'ether') })
            await web3.eth.sendTransaction({ to: account3.etherAddress, from: localAccounts[2], value: web3.utils.toWei('10', 'ether') })
            await web3.eth.sendTransaction({ to: account4.etherAddress, from: localAccounts[3], value: web3.utils.toWei('10', 'ether') })
            
            await simulateTransaction()
            await timeout(2000)
        })

        async function simulateTransaction(){
            for (let i = 0; i < 40; i++){
                await web3.eth.sendTransaction({ to: account5.etherAddress, from: localAccounts[4], value: web3.utils.toWei('10', 'szabo') })    
            }
        }

        it("should update mether balance when deposit ", async () => {
            let balance1 = JSON.parse(await sendGET("getAccount", {id: account1.id})).data.mether.balance;
            assert(balance1==10000000)

            //TODO: check database
        })
        
        it("should update mether balance when transfer ", async () => {
            await sendGET("transfer", {from: account1.id, to: account2.id, value: 2e6})
            let balance1 = JSON.parse(await sendGET("getAccount", {id: account1.id})).data.mether.balance;
            let balance2 = JSON.parse(await sendGET("getAccount", {id: account2.id})).data.mether.balance;
            assert(balance2==12000000)
            assert(balance1==8000000)
        })
    
        it("should update mether balance when withdraw ", async () => {          
            let balance1 = JSON.parse(await sendGET("getAccount", {id: account1.id})).data.mether.balance;
            let receiveEth1 = await web3.eth.getBalance(account2.etherAddress);
            const data = await sendGET("withdraw", {id: account1.id, ethAddr: account2.etherAddress, value: 2e6})
            
            await timeout(2000)
            let balance2 = JSON.parse(await sendGET("getAccount", {id: account1.id})).data.mether.balance;
            let receiveEth2 = await web3.eth.getBalance(account2.etherAddress);
            assert(balance2==8000000)
            assert(receiveEth2=="11999000000000000000")

            
        })
    })

    

    


});