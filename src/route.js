exports = module.exports = function (app, router){

	app.use("/", router);

	router.get("/account/createAccount", createAccount);
	router.get("/account/getAccount", getAccount);
	router.get("/account/getWithdrawFee", getWithdrawFee);
	router.get("/account/transfer", transfer);
	router.get("/account/withdraw", withdraw);
	router.get("/account/getDeposit", getDeposit);

	async function createAccount(req, res){
		console.log("createAccount")
		try {
			var account = await require("./Account/accountAPI").createAccount()
		} catch(err){
			console.log(err)
		}
		console.log("account", account)
		res.json(account)
	}

	async function getAccount(req, res){
		console.log("getAccount")
		try {
			var account = await require("./Account/accountAPI").getAccount(req.query.id)
		} catch(err){
			console.log(err)
		}
		console.log("account", account)
		res.json(account)
	}

	async function getDeposit(req, res){
		console.log("getDeposit")
		try {
			var result = await require("./Account/accountAPI").getDeposit(req.query.id)
		} catch(err){
			console.log(err)
		}
		console.log("deposit", result)
		res.json(result)
	}

	function getWithdrawFee(req, res){
		var fee = require("./Account/accountAPI").getWithdrawFee()
		res.end(fee)
	}

	async function transfer(req, res){
		console.log("transfer", req.query)
		try {
			var result = await require("./Account/accountAPI").transfer(req.query.from, req.query.to, req.query.value)
		} catch(err){
			console.log(err)
		}
		console.log("result", result)
		res.json(result)
	}

	async function withdraw(req, res){
		console.log("withdraw", req.query)
		try {
			var result = await require("./Account/accountAPI").withdraw(req.query.id, req.query.ethAddr, req.query.value)
		} catch(err){
			console.log(err)
		}
		console.log("result", result)
		res.json(result)

	}


	router.all('*', function(req, res) {
		console.log(req.url)
  		res.status("404");
  		res.end()
	});

}
