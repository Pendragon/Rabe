// Name        : thermo.js
// Description : Read a 1wire DS180 thermometer on a Rasperry PI
// Author      : Arthur & Jean-Paul GERST
// Date        : mars 2014  

var util = require('util');
var fs = require('fs');

var debug = false;	// Log all read activity to stdout
var demo = false; 	// If you have no hardware, this prevent error message and return -88.88 degre for all read

// Constructor
// The ID is the OneWire device ID
// Name, your internal probe name
// interval
function Thermo(id, name, interval)
{
	this._id = id;
	this._name = name;
	if (interval)
		this._interval = interval;
	else
		this._interval = 10000;
	this.read_value();
	this._timer = setInterval(
		(function(self) {         //Self-executing func which takes 'this' as self
			return function() {   //Return a function in the context of 'self'
				self.read_value(); //Thing you wanted to run as non-window 'this'
	        }
	})(this), interval);
}

Thermo.prototype.value = function()
{
	return this._value;
}

Thermo.prototype.read_value = function()
{
	var self = this;
	if (!demo) {
		fs.readFile('/sys/bus/w1/devices/' + self._id + '/w1_slave', 'utf8', function (err, data) {
        		if (err) throw err;
	        	self._value = Math.round(new Number(data.split("t=")[1].trim()) / 100) / 10 ;
	        	if (debug) util.log(self._name + ": " + self._value + " degres - id: " + self._id);
		});
	} else {
		self._value = -88.88;
		if (debug) util.log("Demo mode. " + self._name + ": " + self._value + " degres - id: " + self._id);
	}
}


module.exports = Thermo
