// Name        : log.js
// Description : Log information
// Author      : Jean-Paul GERST
// Date        : May 2015

var util = require('util');

var messages = [];
module.exports.messages = messages;

var MAX_MEMORY_HISTORY = 1000;

var output = {screen: true, database: false, memory:true};
module.exports.output = output;



function error(data, catego)
{
	log("E", data, catego);
}
module.exports.error = error;

function warning(data, catego)
{
	log("W", data, catego);
}
module.exports.warning = warning

function debug(data, catego)
{
	log("D", data, catego);
}
module.exports.debug = debug

function info(data, catego)
{
	log("I", data, catego);
}
module.exports.info = info;


/**
 * log the message
 * @param {string} Severity of the log
 * @param {string|object} Content of the log. Can be of the form {desc: <description>, detail: <longer text>}
 * @param {string|object} Optional categories or module of the log. Can be of the form {catego: <main category>}
 */
function log(severity, data, catego) 
{	
	var message = {s: severity};

	if (typeof(data) === 'string') {
		message.data = {desc: data, detail: ''};
	}

	if (typeof(catego) === 'undefined') {
		message.catego = {module: 'default'};
	} else if (typeof(catego) === 'string') {
		message.catego = {module: catego};
	} 

	message.timestamp = new Date();

	if (output.memory) {
		messages.push(message);
		if (messages.length > MAX_MEMORY_HISTORY)
			messages.shift();
	}

	if (output.screen) {
		var msg = message.timestamp.getFullYear() + '/' + Number(message.timestamp.getMonth() + 1) + '/' + message.timestamp.getDate() + ' '; // Date
		msg += message.timestamp.getHours() + ':' + message.timestamp.getMinutes() + ':' + message.timestamp.getSeconds() +  '-'; // Hour
		msg += message.s + ':' + message.catego.module + ' - '  + message.data.desc;
		console.log(msg);
	}
}