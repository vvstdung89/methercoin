exports = module.exports = function (app, router){

	app.use("/", router);

	app.get("/account/createAccount", createAccount);
	app.get("/account/getWithdrawFee", getWithdrawFee);
	app.get("/account/transfer", transfer);
	app.get("/account/withdraw", withdraw);

	async function createAccount(req, res){
		var account = await require("./Account/accountAPI").createAccount()
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
