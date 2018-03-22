const DepositDB = require('../src/models/deposit')

await new Promise(function(resolve){
    new DepositDB({
        accountID: 0,
        from: 0,
        to: 0,
        value: 0,
        status: "processed"
    }).save(function(){
        resolve()
    })
})

