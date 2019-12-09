var path = require('path');

var compression = require('compression');
var express = require('express');
var app = express();
var port = 8100;

app.use(compression());

app.use("/", express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
	console.log("Express app started on port " + port)
})
