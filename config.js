// Name        : config.js
// Description : Configuration file
// Author      : Arthur & Jean-Paul GERST
// Date        : october 2014  


var config = {}


config.web = {};
config.web.port = process.env.WEB_PORT || 8080;
config.database = 'localhost/belmont';

module.exports = config;