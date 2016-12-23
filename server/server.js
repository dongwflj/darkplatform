var path = require('path');
var fs = require('fs');
var log4js = require('log4js');

var logger = log4js.getLogger("root");
log4js.configure({  
    appenders: [   
        { type: 'console', layout: {type:'pattern', "pattern": "%[%d%r %p %c -%] %m%n"}, category: 'root'},  
        { type: 'file', filename: 'server.log', layout: {type:'pattern', "pattern": "%[%d%r %p %c -%] %m%n"}},
    ],      
    levels: {
        root: "DEBUG"
    }   
});       

var runMaster = true;
var showConsole = true;
var debug = false;

// Handle arguments
process.argv.forEach(function(val) {
    if (val == "--nomaster") {
        runMaster = false;
    } else if (val == "--noconsole") {
        showConsole = false;
    } else if (val == "--debug") {
        showConsole = false;
        debug = true;
    } else if (val == "--help") {
        console.log("Proper Usage: node server.js [--master]");
        console.log("    --nomaster            Run master server.");
        console.log("    --noconsole         Disables the console");
        console.log("    --debug             Debug log");
        console.log("    --help              Help menu.");
        console.log("");
    }
});
// Define a var for class
var selected = function consoleObj() {
    this.server;
};

if (runMaster) {
    logger.info("Run with master mode");
    MasterServer = require('./MasterServer');
    masterServer = new MasterServer(selected);
    masterServer.start();
} else {
    logger.info("Run with standalone mode");
}

// Initialize the server console
if (showConsole) {
    var readline = require('readline');
    var in_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}
