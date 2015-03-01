// Name        : config.js
// Description : Configuration file
// Author      : Arthur & Jean-Paul GERST
// Date        : october 2014  


var config = {}


config.web = {};
config.web.port = process.env.WEB_PORT || 8080;
config.web.secret = "lkfdjsjmglkjdfmlkjg ! 36";

config.crypto = {}
config.crypto.password = 'lskfdngm mqkgd ç33àç)àuçàçu';
config.crypto.algo = 'aes-256-ctr';


config.rabe = {};
config.rabe.server = 'rabe.gerst.fr';
config.rabe.server_port = 7234;
config.rabe.name = "Sonde de temperature de Belmont";

config.thermo = {};
config.thermo.debug = true;
config.thermo.demo = true;

module.exports = config;