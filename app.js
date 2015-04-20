// Name        : app.js
// Description : Serveur WEB pour nos thermometres
// Author      : Arthur & Jean-Paul GERST
// Date        : avril 2014  

// Load configuration_file
var config = require('./config')

// Load the Thermo definition & define the hardware id & probe we have
var Thermo = require ('./lib/thermo');		
var thermos = { 
	interieur: new Thermo("28-00000556a548", "Interieur", 300000), // 300 000 = 5 * 60 * 1000 = every 5 minutes
	exterieur: new Thermo("28-00000555dec3", "Exterieur", 300000) 
};

var express = require('express');
var cookieParser = require('cookie-parser')
var session	= require('express-session')
var app = express();
var bodyParser = require('body-parser');

var util = require('util');

// The res.render function bellow will use the ejs engine.
// the first argument of .render is the name of the views/<name>.ejs file that will be transformed into html
app.set('view engine', 'ejs');

// all files in /static will be renderer directly without anayses from application
app.use(express.static(__dirname + '/static'));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({
	secret: config.web.secret, 
	resave: false,
  	saveUninitialized: true
}));


// Mise a jour des variables.
app.use(function(req, res, next) {
	req.thermos = thermos;
	next();
});


app.get('/', function(req, res) { 
	res.render('index', {title: "Hello !"});
});


// Ajax call to get the various thermo value
// this only sent the result to the browser. Not an html page. It's intended to be used by a javascipt client side.
app.get('/thermos/:name', function(req, res) {
	// the toString() took me an evening to find.
	// by default res.send will behave differently if the parameter is a string or a number
	// a string is sent to the browser to display, and he result from the resquest is 200 (ok), 
	// a number is considered as the result. As temperature was never 200, the browser consider the request failled...
	var resp = thermos[req.params.name].value() ;
	if (resp) {
		res.send(resp.toString());
	}
	else {// Application is restarting, but a browser update is comming
		res.send(500);
	}
});

// Ajax call to get the various thermo value
// this only sent the result to the browser. Not an html page. It's intended to be used by a javascipt client side.
app.get('/thermos/:name/history', function(req, res) {
	var resp = thermos[req.params.name].history() ;
	if (resp) {
		res.send(resp.toString());
	}
	else {// Application is restarting, but a browser update is comming
		res.send(500);
	}
});


// 
//
var server = app.listen(config.web.port, function() {
    util.log(config.rabe.name + ' started on port ' + server.address().port);
});

