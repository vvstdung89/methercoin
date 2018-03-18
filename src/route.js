exports = module.exports = function (app, router){

	app.use("/", router);
	
	

	router.all('*', function(req, res) {
		console.log(req.url)
  		res.status("404");
  		res.end()
	});

}
