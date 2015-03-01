// Name        : cryptage.js
// Description : 
// Author      : Arthur & Jean-Paul GERST
// Date        : Janvier 2015  

var util = require('util');
var fs = require('fs');
var config = require('../config')
var crypto = require('crypto');


// Encrypt an objet
var encrypt_obj =  function(obj) 
{
  	return encrypt_text(JSON.stringify(obj));
}
module.exports.encrypt_obj = encrypt_obj

var encrypt_text = function(text)
{
	var cipher = crypto.createCipher(config.crypto.algo, config.crypto.password);
  	var crypted = cipher.update(JSON.stringify(text), 'utf8', 'hex');

  	crypted += cipher.final('hex');
  	return crypted;
}


var decrypt_text = function(encrypted)
{
  var decipher = crypto.createDecipher(config.crypto.algo, config.crypto.password);
  var dec = decipher.update(encrypted,'hex','utf8');

  dec += decipher.final('utf8');
  return dec;
}


var decrypt_obj = function(encrypted_obj)
{
	return JSON.parse(decrypt_text(encrypted_obj));
}
module.exports.decrypt_obj = decrypt_obj;