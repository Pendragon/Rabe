// Name        : cryptage.js
// Description : 
// Author      : Arthur & Jean-Paul GERST
// Date        : Janvier 2015  

var util = require('util');
var fs = require('fs');
var config = require('../config')
var crypto = require('crypto');

// Constructor
function Cryptage() 
{

}

// Encrypt an objet
Cryptage.prototype.encrypt_obj = function(obj) 
{
  	var self = this;

  	return self.encrypt_text(JSON.stringify(obj));
}

Cryptage.prototype.encrypt_text = function(text)
{
	var cipher = crypto.createCipher('aes-256-ctr', config.crypto.password)
  	var crypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  	crypted += cipher.final('hex');
}
