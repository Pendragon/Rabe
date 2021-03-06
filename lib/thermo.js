// Name        : thermo.js
// Description : Read a 1wire DS180 thermometer on a Rasperry PI
// Author      : Arthur & Jean-Paul GERST
// Date        : mars 2014  

var util = require('util');
var fs = require('fs');
var config = require('../config')
var cryptage = require('./cryptage');
var server = require('./client');
var log = require('./logger');


var debug = config.thermo.debug;	// Log all read activity to stdout
var demo = config.thermo.demo; 	// If you have no hardware, this prevent error message and return -88.88 degre for all read


/**
 * Constructor
 * 
 * @param {string} id, 1wire device ID as stored in the hardware
 * @param {string} name, the name of the thermo in the application
 * @param {integer} [optional] interval, millisecond between two hardware read
 */
function Thermo(id, name, interval)
{
	this._history = [];
	this._to_send = [];
	this._alerte_gel = undefined;
	this._alerte_feu = undefined;
	this._id = id;
	this._name = name;
	this._lastread = new Date('2000','01', '01');
	if (interval)
		this._interval = interval;
	else
		this._interval = 10000;
	this.read_value();


	// It took me hours to find out that .this was not useable with callbacks
	// With setInterval, you HAVE TO use a call back and this.  Here is a workaround
	// I would not be able to rewrite it without aving a look at the explaination
	// http://stackoverflow.com/questions/2749244/javascript-setinterval-and-this-solution

	// We read the hardware value every <interval> millisecondes
	setInterval(
		(function(self) {       //Self-executing func which takes 'this' as self
			return function() {	//Return a function in the context of 'self'
				self.read_value(); //Thing you wanted to run as non-window 'this'
	        }
	})(this), interval);

	// Value will be save every 10 minutes in the db
	setInterval(
		(function(self) {       //Self-executing func which takes 'this' as self
			return function() {	//Return a function in the context of 'self'
				self.send(); //Thing you wanted to run as non-window 'this'
	        }
	})(this), 10 * 60 * 1000);
}


/**
 * Return the history list compatible with http://api.highcharts.com/highcharts#data  
 * Date, value, min, max (if gel & fire are defined)
 *
 * @return {string}
 */
Thermo.prototype.history = function() 
{
	//var data = "Date, " + this._name + "\n";
	var data = "";
	this._history.forEach(function(mesure) {
		data = data + mesure.read_at.toISOString() + "," + mesure.value + "\n";
	});

	return data;
}


/**
 * Return the value of this thermo
 * 
 * @return {double} 
 */
Thermo.prototype.value = function()
{
	return this._value;
}


/**
 * Return the name of this thermo
 * 
 * @return {string} 
 */
Thermo.prototype.name = function()
{
	return this._name;
}


/**
 * Send all buffered data to the server.
 */
Thermo.prototype.send = function()
{
	// while (this._to_send.length > 0)
	// 	server.send('Belmont', 'Temperature ' + this._name, this._to_send.shift());
}


/**
 * Save the current value into the database in a 'thermo' collection
 * in version 0.0.2 and up, this send information to the server
 */
Thermo.prototype.save = function()
{
	var self = this;
	var data = {name : self._name, value: self._value, oid: self._id, read_at: self._lastread};

	// On the real platform, for some reason, first read are undefined
	if (data.value)
	{
		self._history.push(data);
		self._to_send.push(data);
		if (self._history.length > config.thermo.maxhistory)
			self._history.shift();		
	}

	self.send();
	// Retrieve the thermo collection for the database (this will create on if none exist)
//	var dbvalues = this._db.get('thermo');

	// Insert the value into the collection	
//	dbvalues.insert({ name: this._name, value: this._value, created: new Date() }, function (err, doc) {
  		// if (err) throw err;
//	}); //

	// Inserted object will look like :
	// { "name" : "Interieur", "value" : -0.000009255965345975643e, "created" : ISODate("2014-05-29T08:02:30.023Z"), "_id" : ObjectId("5386e996add0fe390f000009") }
	// { "name" : "Exterieur", "value" : 25, "created" : ISODate("2014-05-29T08:02:30.055Z"), "_id" : ObjectId("5386e996add0fe390f00000a") }
	// See the difference between integer and float (stored as double)
	// Also take a look at the _id which is created automatically
	// Date are converted to ISODate that are stored internally in UTC 
}


/**
 * Read the value of the temperature in the device. Thanks the various linux modules this
 * is really easy, as 1wire devices are files.
 * http://www.framboise314.fr/mesure-de-temperature-1-wire-ds18b20-avec-le-raspberry-pi/
 *
 */
Thermo.prototype.read_value = function()
{
	var self = this;
	if (!demo) {
		// each file to read has the following content:
		// b1 01 4b 46 7f ff 0f 10 8d : crc=8d YES
		// b1 01 4b 46 7f ff 0f 10 8d t=27062
		fs.readFile('/sys/bus/w1/devices/' + self._id + '/w1_slave', 'utf8', function (err, data) {
        		if (err) throw err;
        		// In the file, we take everything after t= (result => 27062)
        		// What remains is converted to a number
        		// Then divided by 100 and rounded (result => 271)
        		// Then divided by 10 (result => 27.1 Celsius)
	        	self._value = Math.round(new Number(data.split("t=")[1].trim()) / 100) / 10 ;
	        	log.debug(self._name + ": " + self._value + " degres - id: " + self._id, 'Thermo ' + self._name);
	        	
	        	// In case of hardware / transmission failure, the readed value is 85
	        	// no need to store this information. Let's log a communication issue, and do not add 85 to the DB
	        	if (self._value == 85) {
	        		log.warning('Error while reading thermometer value. 85 degre found.', 'Thermo ' + self._name);
	        	} else {
		        	self._lastread = new Date();
        			self.save();
	        	}
		});
	} else {
		self._lastread = new Date();
		if (self._name == "Exterieur")
			self._value = -50.88;
		else
			self._value = -60.88;

		self.save();
		log.debug("Demo mode. " + self._name + ": " + self._value + " degres - id: " + self._id, 'Thermo ' + self._name);
	}
}


module.exports = Thermo
