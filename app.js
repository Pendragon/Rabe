// Name        : app.js
// Description : Serveur WEB pour nos thermometres
// Author      : Arthur & Jean-Paul GERST
// Date        : avril 2014  

var port = 3000; // Port de communication ou notre serveur écoute. Par défaut, un serveur web doit être sur le port 80

var Thermo = require ('./lib/thermo.js');		// Load the Thermo definition & define the hardware id & probe we have
var thermos = { interieur: new Thermo("28-00000556a548", "Interieur", 10000), exterieur: new Thermo("28-00000555dec3", "Exterieur", 10000) };

var express = require('express');				
var app = express();

// Monk was brokken for Rasperry PI.
// I had to recompile it. 
// http://stackoverflow.com/questions/16746134/bus-error-on-mongodb-mongoclient-connect-for-raspberry-pi-arm
var monk = require('monk'); 
var db = monk('localhost/belmont');	// Link to the local 'belmont' database. 

// The res.render function bellow will use the ejs engine.
// the first argument of .render is the name of the views/<name>.ejs file that will be transformed into html
app.set('view engine', 'ejs');

// all files in /static will be renderer directly without anayses from application
app.use(express.static(__dirname + '/static'));

// Mise a jour des variables.
app.use(function(req, res, next) {
	req.thermos = thermos;
	req.db = db;
	next();
});

// a curent empty page that will be the login page
app.get('/', function(req, res) { 
	res.render('index', {title: "Hello !"});
});

// Basic test to see the current thermo value in a graphical result
app.get('/test', function(req, res) {
 	res.render('test', {titre: "Thermo read test", thermos: thermos});
});

// db test
app.get('/db', function(req, res) {
	var collection = req.db.get('users');
	collection.find({}, function(e, users) {
		res.render('db', {users: users});
	});
});

// Ajax call to get the various thermo value
// this only sent the result to the browser. Not an html page. It's intended to be used by a javascipt client side.
app.get('/thermos/:name', function(req, res) {
	// the toString() took me an evening to find.
	// by default res.send will behave differently if the parameter is a string or a number
	// a string is sent to the browser to display, and he result from the resquest is 200 (ok), 
	// a number is considered as the result. As temperature was never 200, the browser consider the request failled...
	res.send(thermos[req.params.name].value().toString());
});

var server = app.listen(port, function() {
    console.log('Server started on port %d', server.address().port);
});

