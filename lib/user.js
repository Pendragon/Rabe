// Name        : users.js
// Description : handle user management
// Author      : Arthur & Jean-Paul GERST
// Date        : mars 2014  

var util = require('util');
var fs = require('fs');
var bcrypt = require('bcryptjs');


/**
 * Constructor
 * 
 */
function User (db) 
{
	this._db = db;
}


/**
 * Retrieve the User by Id and make appropriate actions
 *
 * @param {string} user id
 */
User.prototype.getbyID = function(id, callback) 
{
	var users = this._db.get("users");

	users.findById(id, function(err, doc) {		
		if (err) callback(err, null); else callback(null, doc);
	});
}


/**
 * Retrieve the User by his name
 *
 * @param {string} research name(email)
 * @param {function} callback(err, user)
 */
User.prototype.getbyname = function(name, callback) 
{
	var users = this._db.get("users");

	users.find({email: name}, function(err, docs) {
		util.log("Toto");
		if (err) callback(err, null); else callback(null, docs[0]);
	});
}


/**
 * Create a user with a given email and password
 *
 * @param {string} email
 * @param {string} password
 * @param {function} callback(err, user)
 */
User.prototype.create = function(name, password, callback)
{
	var users = this._db.get("users");

	var salt = bcrypt.genSaltSync(10);
	util.log('Salt: ' + salt + ' Password: ' + password);
	var hash = bcrypt.hashSync(password, salt);

	users.insert({email: name, password:hash, created: new Date() }, function(err, doc) {
		if (err) 
			callback(err, null); 
		else 
			callback(null, doc);
	});

}


/**
 * Authenticate a user
 *
 * @param {string} email
 * @param {string} password
 * @param {function} callback(err, user)
 */
 User.prototype.auth = function(name, password, callback)
 {
	var users = this._db.get("users");
	
	this.getbyname(name, function(err, result) {
		if (err) throw err;

		if (result && bcrypt.compareSync(password, result.password))
			callback(err, result);
		else
			callback(err, null);
	});
 }

module.exports = User