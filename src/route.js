exports = module.exports = function (app, router){

	app.use("/", router);

	router.get("/account/createAccount", createAccount);
	router.get("/account/getWithdrawFee", getWithdrawFee);
	router.get("/account/transfer", transfer);
	router.get("/account/withdraw", withdraw);

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


	function getWithdrawFee(req, res){
		var fee = require("./Account/accountAPI").getWithdrawFee()
		res.end(fee)
	}

	async function transfer(req, res){
		var result = await require("./Account/accountAPI").transfer(req.query.from, req.query.to, req.query.value)
		res.json(result)
	}

	async function withdraw(req, res){
		var result = await require("./Account/accountAPI").withdraw(req.query.accountID, req.query.ethAddr, req.query.value)
		res.json(result)
	}


	router.all('*', function(req, res) {
		console.log(req.url)
  		res.status("404");
  		res.end()
	});

}
