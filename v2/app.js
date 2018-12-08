var path = require('path');

var compression = require('compression');
var express = require('express');
var app = express();

app.use(compression());

app.use("/", express.static(path.join(__dirname, 'public')));

app.listen(8100);
