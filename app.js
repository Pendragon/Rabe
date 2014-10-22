// Name        : app.js
// Description : Serveur WEB pour nos thermometres
// Author      : Arthur & Jean-Paul GERST
// Date        : avril 2014  

var port = 8080; // Port de communication ou notre serveur écoute. Par défaut, un serveur web doit être sur le port 80

// Monk was brokken for Rasperry PI.
// I had to recompile it. 
// http://stackoverflow.com/questions/16746134/bus-error-on-mongodb-mongoclient-connect-for-raspberry-pi-arm
var monk = require('monk'); 
var db = monk('localhost/belmont');	// Link to the local 'belmont' database. 

// Dummy modification 

var User = require('./lib/user');
// Load the Thermo definition & define the hardware id & probe we have
var Thermo = require ('./lib/thermo');		
var thermos = { 
	interieur: new Thermo("28-00000555dec3", "Interieur", db, 10000), 
	exterieur: new Thermo("28-00000556a548", "Exterieur", db, 10000) 
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
app.use(session({secret: "lskfdnjglmkjlmsd kljlmkj 86"}));


// Mise a jour des variables.
app.use(function(req, res, next) {
	req.thermos = thermos;
	req.db = db;
	next();
});


app.get('/login', function(req, res) {
	res.render('login', {});
});


app.post('/login', function(req, res) {
	var user = new User(req.db);

	user.auth(req.body.user, req.body.password, function(err, result) {
		util.log(util.inspect(result));
		if (result) {
			req.session.uid = result._id;
			res.render('index', {title: "Hello World"});			
		}
		else
			res.render('login', {});
	})
});


// All pages on this site needs a valid session. If not, go to login page
// WARNING login post and get needs to be declared before this one
app.use(function(req, res, next) {
	var sess = req.session;

	if (sess.uid)
		next();
	else
		res.render('login', {});
});


app.get('/logout', function(req, res){  
  req.session.destroy(function(){
    res.redirect('/');
  });
});


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


app.post('/user/create', function(req, res) {
	var user = new User(req.db);

	util.log(util.inspect(req.body));

	user.getbyname(req.body.email, function(err, result) {
		if (err) throw err;

		if (result) 
			res.render('user_create', {result: 'E', message: "Utilisateur existant"});
		else
			user.create(req.body.email, req.body.password, function(err, result) {
				if (result)
					res.render('user_create', {result: 'OK', message: "Creation OK: " + result._id});	
				else
					res.render('user_create', {result: 'E', message: "Erreur de creation OK"});	
			})
	})
});


app.get('/user/create', function(req, res) {
	res.render('user_create', {result: '', message: " - - "});
});


// Check if a user exist or not
app.get('/user/check/:name', function(req, res) {
	var user = new User(req.db);
	util.log("Checking name " + req.params.name);
	user.getbyname(req.params.name, function(err, user) {
		if (user) res.send("OK"); else res.send("E");
	})
})


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
    util.log('Server started on port ' + server.address().port);
});
