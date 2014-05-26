// Name        : app.js
// Description : Serveur WEB pour nos thermometres
// Author      : Arthur & Jean-Paul GERST
// Date        : avril 2014  

var port = 80; // Port de communication ou notre serveur écoute. Par défaut, un serveur web doit être sur le port 80
var version = "0.0.1"; // version de notre programe

var Thermo = require ('./lib/thermo.js');
var thermos = { interieur: new Thermo("28-00000556a548", "Interieur", 10000), exterieur: new Thermo("28-00000555dec3", "Exterieur", 10000) };
var express = require('express');
var app = express();
//var bodyparser = require('body-parser');
var monk = require('monk');
var db = monk('localhost/belmont');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/static'));
//app.use(bodyparser());

// Mise a jour des variables.
app.use(function(req, res, next) {
	req.thermos = thermos;
	req.db = db;
	next();
});

app.get('/', function(req, res) { 
	res.render('index', {title: "Hello !"});
});

app.get('/test', function(req, res) {
 	res.render('test', {titre: version, thermos: thermos});
});

app.get('/db', function(req, res) {
	var collection = req.db.get('users');
	collection.find({}, function(e, users) {
		res.render('db', {users: users});
	});
});

app.get('/thermos/:name', function(req, res) {
	res.send(thermos[req.params.name].value().toString());
});

var server = app.listen(port, function() {
    console.log('Serveur version %s a l\'ecoute sur le port %d', version, server.address().port);
});

