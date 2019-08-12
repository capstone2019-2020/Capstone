const express 	= require('express');
const morgan		= require('morgan');
const bodyParser	= require('body-parser');	// pull info from HTML POST (express4)
const methodOverride = require('method-override');

const app 		= express();
app.use(express.static('.'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(methodOverride());


app.get('/cytoscape', function(req, res) {
  res.sendfile('cytoscape-demo/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/gojs', function(req, res) {
  res.sendfile('gojs-demo/index.html');
});

app.get('/svg-js', function(req, res) {
  res.sendfile('svg-js-demo/index.html');
});

app.listen(8080);
console.log("App listening on port 8080");
