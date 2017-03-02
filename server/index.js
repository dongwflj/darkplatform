﻿// Imports
var Logger = require('./modules/Logger');
//var Commands = require('./modules/CommandList');
var DarkServer = require('./core/DarkServer');

// Init variables
var showConsole = false;

// Start msg
Logger.start();

process.on('exit', function (code) {
    Logger.debug("process.exit(" + code + ")");
    Logger.shutdown();
});

process.on('uncaughtException', function (err) {
    Logger.fatal(err.stack);
    process.exit(1);
});

// Handle arguments
process.argv.forEach(function (val) {
    if (val == "--console") {
        showConsole = true;
    } else if (val == "--help") {
        console.log("Proper Usage: node index.js");
        console.log("    --noconsole         Disables the console");
        console.log("    --help              Help menu.");
        console.log("");
    }
});

// Run Ogar
var darkServer = new DarkServer();
Logger.info("Dark server: " + darkServer.version + " started");
darkServer.start();

// Add command handler
//darkServer.commands = Commands.list;
// Initialize the server console
if (showConsole) {
    var readline = require('readline');
    var in_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    setTimeout(prompt, 100);
}

// Console functions
function prompt() {
    in_.question("dark>", function (str) {
        try {
            parseCommands(str);
        } catch (err) {
            Logger.error(err.stack);
        } finally {
            setTimeout(prompt, 0);
        }
    });
}

function parseCommands(str) {
    // Log the string
    Logger.write("console cmd:" + str);
/*    
    // Don't process ENTER
    if (str === '')
        return;
    
    // Splits the string
    var split = str.split(" ");
    
    // Process the first string value
    var first = split[0].toLowerCase();
    
    // Get command function
    var execute = darkServer.commands[first];
    if (typeof execute != 'undefined') {
        execute(darkServer, split);
    } else {
        Logger.warn("Invalid Command!");
    }
*/
}
