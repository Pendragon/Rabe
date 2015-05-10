// Name        : client.js
// Description : Handle Rabe-server link - client side
// Author      : Jean-Paul GERST
// Date        : avril 2015


// Protocole desciption

var config = require('../config')
var cryptage = require('./cryptage');
var http = require('http');

/**
 * Send infformation to the server
 * @param {string} Module name 
 * @param {string} Id of the sender accordinf to module definition 
 * @param {object} Data to ssend
 * @param {callback} Callback function receiving an obj 
 */
var send = function(module_name, id, obj, callback)
{
	var to_encrypt = {id: id, data: obj};
	var crypted = cryptage.encrypt_obj(to_encrypt);
//	var to_send = querystring.stringify({data: crypted});	
	var options = {
		hostname: config.rabe.server,
		port: config.rabe.server_port,
		path: '/' + module_name,
		method: 'POST',
		headers: {
	    	'Content-Type': 'application/binary',
	    	'Content-Length': crypted.length
	  	}
	};

	var req = http.request(options, function(res) {
		var received = '';
		res.on('data', function(chunk) {
			received = received + chunk;
		});
		res.on('end', function() {
			callback(cryptage.decrypt_obj(received));
		});
	});
	req.on('error', function(error) {

	});

	req.write(crypted);
	req.end();
}
module.exports.send = send

/**
 * Test the connection to the server and / or to a module name
 * @param {string} module name to test communication to. 
 * @return {string}
 */
var ping = function(callback) 
{
	send('server', 'ping', callback)
}
module.exports.ping = ping
