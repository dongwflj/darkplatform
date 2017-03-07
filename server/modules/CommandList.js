// Imports
var Mode = require('../modes');
var Logger = require('./Logger');
var Entity = require('../core/entity');

function Commands() {
    this.list = {}; // Empty
}

module.exports = Commands;

// Utils
var fillChar = function(data, char, fieldLength, rTL) {
    var result = data.toString();
    if (rTL === true) {
        for (var i = result.length; i < fieldLength; i++)
            result = char.concat(result);
    } else {
        for (var i = result.length; i < fieldLength; i++)
            result = result.concat(char);
    }
    return result;
};

// Commands
Commands.list = {
    help: function(darkServer, split) {
       Logger.print("                       ┌────────────────────────────┐                       \n"+
                    "                       │ LIST OF AVAILABLE COMMANDS │                       \n"+
                    "┌──────────────────────┴────────────────────────────┴──────────────────────┐\n"+
                    "│                         ----Players and AI----                           │\n"+
                    "│                                                                          │\n"+
                    "│ playerlist                   │ Get list of players, bots, ID's, etc      │\n"+
                    "│ minion [PlayerID] [#] [name] │ Adds suicide minions to the server        │\n"+
                    "│ addbot [number]              │ Adds bots to the server                   │\n"+
                    "│ kickbot [number]             │ Kick a number of bots                     │\n"+
                    "│ kick [PlayerID]              │ Kick player or bot by client ID           │\n"+
                    "│ kickall                      │ Kick all players and bots                 │\n"+
                    "│ kill [PlayerID]              │ Kill cell(s) by client ID                 │\n"+
                    "│ killall                      │ Kill everyone                             │\n"+
                    "│                                                                          │\n"+
                    "│                          ----Player Commands----                         │\n"+
                    "│                                                                          │\n"+
                    "│ spawn [entity] [pos] [mass]  │ Spawns an entity                          │\n"+
                    "│ mass [PlayerID] [mass]       │ Set cell(s) mass by client ID             │\n"+
                    "│ merge [PlayerID]             │ Merge all client's cells                  │\n"+
                    "│ spawnmass [PlayerID] [mass]  │ Sets a players spawn mass                 │\n"+
                    "│ freeze [PlayerID]            │ Freezes a player                          │\n"+
                    "│ speed [PlayerID]             │ Sets a players base speed                 │\n"+
                    "│ color [PlayerID] [R] [G] [B] │ Set cell(s) color by client ID            │\n"+
                    "│ name [PlayerID] [name]       │ Change cell(s) name by client ID          │\n"+
                    "│ skin [PlayerID] [string]     │ Change cell(s) skin by client ID          │\n"+
                    "│ rec [PlayerID]               │ Gives a player instant-recombine          │\n"+
                    "│ split [PlayerID] [Amount]    │ Forces a player to split                  │\n"+
                    "│ tp [X] [Y]                   │ Teleports player(s) to XY coordinates     │\n"+
                    "│ replace [PlayerID] [entity]  │ Replaces a player with an entity          │\n"+
                    "│ pop [PlayerID]               │ Pops a player with a virus                │\n"+
                    "| explode [PlayerID]           | Explodes a player into ejected mass       |\n"+
                    "│                                                                          │\n"+
                    "│                          ----Server Commands----                         │\n"+
                    "│                                                                          │\n"+
                    "│ pause                        │ Pause game, freeze all nodes              │\n"+
                    "│ board [string] [string] ...  │ Set scoreboard text                       │\n"+
                    "│ change [setting] [value]     │ Change specified settings                 │\n"+
                    "│ reload                       │ Reload config file and banlist            │\n"+
                    "│ ban [PlayerID │ IP]          │ Bans a player(s) IP                       │\n"+
                    "│ unban [IP]                   │ Unbans an IP                              │\n"+
                    "│ banlist                      │ Get list of banned IPs.                   │\n"+
                    "│ mute [PlayerID]              │ Mute player from chat                     │\n"+
                    "│ unmute [PlayerID]            │ Unmute player from chat                   │\n"+
                    "| lms                          | Starts/ends last man standing             |\n"+
                    "│                                                                          │\n"+
                    "│                          ----Miscellaneous----                           │\n"+
                    "│                                                                          │\n"+
                    "│ clear                        │ Clear console output                      │\n"+
                    "│ reset                        │ Removes all nodes                         │\n"+
                    "│ status                       │ Get server status                         │\n"+
                    "│ debug                        │ Get/check node lengths                    │\n"+
                    "│ exit                         │ Stop the server                           │\n"+
                    "│                                                                          │\n"+
                    "├──────────────────────────────────────────────────────────────────────────┤\n"+
                    '│         Psst! Do "shortcuts" for a list of command shortcuts!            │\n'+
                    "└──────────────────────────────────────────────────────────────────────────┘");
    },
    shortcuts: function(darkServer, split) {
       Logger.print("                       ┌────────────────────────────┐                       \n"+
                    "                       │ LIST OF COMMAND SHORTCUTS  │                       \n"+
                    "┌──────────────────────┴──────┬─────────────────────┴──────────────────────┐\n"+
                    "│ st                          │ Alias for status                           │\n"+
                    "│ pl                          │ Alias for playerlist                       │\n"+
                    "│ m                           │ Alias for mass                             │\n"+
                    "│ sm                          │ Alias for spawnmass                        │\n"+
                    "│ ka                          │ Alias for killall                          │\n"+
                    "│ k                           │ Alias for kill                             │\n"+
                    "│ mg                          │ Alias for merge                            │\n"+
                    "│ s                           │ Alias for speed                            │\n"+
                    "│ mn                          │ Alias for minion                           │\n"+
                    "│ f                           │ Alias for freeze                           │\n"+
                    "│ ab                          │ Alias for addbot                           │\n"+
                    "│ kb                          │ Alias for kickbot                          │\n"+
                    "│ c                           │ Alias for change                           │\n"+
                    "│ n                           │ Alias for name                             │\n"+
                    "│ rep                         │ Alias for replace                          │\n"+
                    "| e                           | Alias for explode                          |\n"+
                    "└─────────────────────────────┴────────────────────────────────────────────┘");
    },
    debug: function(darkServer, split) {
        // Count client cells
        var clientCells = 0;
        for (var i in darkServer.m_Clients) {
            clientCells += darkServer.m_Clients[i].playerTracker.cells.length;
        }
        // Output node information
       Logger.print("Clients:        " + fillChar(darkServer.m_Clients.length, " ", 4, true) + " / " + darkServer.config.serverMaxConnections + " + bots"+"\n"+
                    "Total nodes:" + fillChar(darkServer.nodes.length, " ", 8, true)+"\n"+
                    "- Client cells: " + fillChar(clientCells, " ", 4, true) + " / " + (darkServer.m_Clients.length * darkServer.config.playerMaxCells)+"\n"+
                    "- Ejected cells:" + fillChar(darkServer.nodesEjected.length, " ", 4, true)+"\n"+
                    "- Food:        " + fillChar(darkServer.nodesFood.length, " ", 4, true) + " / " + darkServer.config.foodMaxAmount+"\n"+
                    "- Viruses:      " + fillChar(darkServer.nodesVirus.length, " ", 4, true) + " / " + darkServer.config.virusMaxAmount+"\n"+
                    "Moving nodes:   " + fillChar(darkServer.movingNodes.length, " ", 4, true)+"\n"+
                    "Quad nodes:     " + fillChar(darkServer.quadTree.scanNodeCount(), " ", 4, true)+"\n"+
                    "Quad items:     " + fillChar(darkServer.quadTree.scanItemCount(), " ", 4, true));
    },
    reset: function(darkServer, split) {
        Logger.warn("Removed " + darkServer.nodes.length + " nodes");
        // Remove all nodes in the entire universe
        while (darkServer.nodes.length)
            darkServer.removeNode(darkServer.nodes[0]);
        while (darkServer.nodesEjected.length)
            darkServer.removeNode(darkServer.nodesEjected[0]);
        while (darkServer.nodesFood.length)
            darkServer.removeNode(darkServer.nodesFood[0]);
        while (darkServer.nodesVirus.length)
            darkServer.removeNode(darkServer.nodesVirus[0]);
        Commands.list.killall(darkServer, split);
    },
    minion: function(darkServer, split) {
        var id = parseInt(split[1]);
        var add = parseInt(split[2]);
        var name = split.slice(3, split.length).join(' ');
            
        // Error! ID is NaN
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player id!");
            return;
        }
        
        // Find ID specified and add/remove minions for them
        for (var i in darkServer.m_Clients) {
            var client = darkServer.m_Clients[i].playerTracker;
            
            if (client.pID == id) {
                // Remove minions
                if (client.minionControl === true && isNaN(add)) {
                    client.minionControl = false;
                    client.miQ = 0;
                    Logger.print("Succesfully removed minions for " + getName(client._name));
                // Add minions
                } else {
                    client.minionControl = true;
                    // Add minions for client
                    if (isNaN(add)) add = 1; 
                    for (var i = 0; i < add; i++) {
                        darkServer.bots.addMinion(client, name);
                    }
                    Logger.print("Added " + add + " minions for " + getName(client._name));
                }
                break;
            }
        }
    },
    addbot: function(darkServer, split) {
        var add = parseInt(split[1]);
        if (isNaN(add)) {
            add = 1; // Adds 1 bot if user doesnt specify a number
        }
        
        for (var i = 0; i < add; i++) {
            darkServer.bots.addBot();
        }
        Logger.print("Added " + add + " player bots");
    },
    ban: function(darkServer, split) {
        // Error message
        var logInvalid = "Please specify a valid player ID or IP address!";
        
        if (split[1] === null) {
            // If no input is given; added to avoid error
            Logger.warn(logInvalid);
            return;
        }
        
        if (split[1].indexOf(".") >= 0) {
            // If input is an IP address
            var ip = split[1];
            var ipParts = ip.split(".");
            
            // Check for invalid decimal numbers of the IP address
            for (var i in ipParts) {
                if (i > 1 && ipParts[i] == "*") {
                    // mask for sub-net
                    continue;
                }
                // If not numerical or if it's not between 0 and 255
                // TODO: Catch string "e" as it means "10^".
                if (isNaN(ipParts[i]) || ipParts[i] < 0 || ipParts[i] >= 256) {
                    Logger.warn(logInvalid);
                    return;
                }
            }
            
            if (ipParts.length != 4) {
                // an IP without 3 decimals
                Logger.warn(logInvalid);
                return;
            }
            ban(darkServer, split, ip);
            return;
        }
        // if input is a Player ID
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            // If not numerical
            Logger.warn(logInvalid);
            return;
        }
        var ip = null;
        for (var i in darkServer.m_Clients) {
            var client = darkServer.m_Clients[i];
            if (!client || !client.isConnected)
                continue;
            if (client.playerTracker.pID == id) {
                ip = client._socket.remoteAddress;
                break;
            }
        }
        if (ip) ban(darkServer, split, ip);
        else Logger.warn("Player ID " + id + " not found!");
    },
    banlist: function(darkServer, split) {
        Logger.print("Showing " + darkServer.ipBanList.length + " banned IPs: ");
        Logger.print(" IP              | IP ");
        Logger.print("───────────────────────────────────");
                      
        for (var i = 0; i < darkServer.ipBanList.length; i += 2) {
            Logger.print(" " + fillChar(darkServer.ipBanList[i], " ", 15) + " | " +
                    (darkServer.ipBanList.length === i + 1 ? "" : darkServer.ipBanList[i + 1])
            );
        }
    },
    kickbot: function(darkServer, split) {
        var toRemove = parseInt(split[1]);
        if (isNaN(toRemove)) {
            // Kick all bots if user doesnt specify a number
            toRemove = darkServer.m_Clients.length; 
        }
        var removed = 0;
        for (var i = 0; i < darkServer.m_Clients.length; i++) {
            if (darkServer.m_Clients[i].isConnected != null) 
                continue; // verify that the client is a bot
            darkServer.m_Clients[i].close();
            removed++;
            if (removed >= toRemove)
                break;
        }
        if (!removed)
            Logger.warn("Cannot find any bots");
        else if (toRemove == removed)
            Logger.warn("Kicked " + removed + " bots");
        else
            Logger.warn("Only " + removed + " bots were kicked");
    },
    board: function(darkServer, split) {
        var newLB = [];
        var reset = split[1];
        
        for (var i = 1; i < split.length; i++) {
            if (split[i]) newLB[i - 1] = split[i];
            else newLB[i - 1] = " ";
        }
        
        // Clears the update leaderboard function and replaces it with our own
        darkServer.darkMode.packetLB = 48;
        darkServer.darkMode.specByLeaderboard = false;
        darkServer.darkMode.updateLB = function (darkServer) {
            darkServer.leaderboard = newLB;
            darkServer.leaderboardType = 48;
        };
        if (reset != "reset") {
            Logger.print("Successfully changed leaderboard values");
            Logger.print('Do "board reset" to reset leaderboard');
        } else {
            // Gets the current gamemode
            var gm = Mode.get(darkServer.darkMode.ID);
        
            // Replace functions
            darkServer.darkMode.packetLB = gm.packetLB;
            darkServer.darkMode.updateLB = gm.updateLB;
            Logger.print("Successfully reset leaderboard");
        }
    },
    change: function(darkServer, split) {
        if (split.length < 3) {
            Logger.warn("Invalid command arguments");
            return;
        }
        var key = split[1];
        var value = split[2];
        
        // Check if int/float
        if (value.indexOf('.') != -1) {
            value = parseFloat(value);
        } else {
            value = parseInt(value);
        }
        
        if (value == null || isNaN(value)) {
            Logger.warn("Invalid value: " + value);
            return;
        }
        if (!darkServer.config.hasOwnProperty(key)) {
            Logger.warn("Unknown config value: " + key);
            return;
        }
        darkServer.config[key] = value;
        
        // update/validate
        darkServer.config.playerMinSize = Math.max(32, darkServer.config.playerMinSize);
        Logger.setVerbosity(darkServer.config.logVerbosity);
        Logger.setFileVerbosity(darkServer.config.logFileVerbosity);
        Logger.print("Set " + key + " = " + darkServer.config[key]);
    },
    clear: function() {
        process.stdout.write("\u001b[2J\u001b[0;0H");
    },
    color: function(darkServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        // Get colors
        var color = { r: 0, g: 0, b: 0 };
        color.r = Math.max(Math.min(parseInt(split[2]), 255), 0);
        color.g = Math.max(Math.min(parseInt(split[3]), 255), 0);
        color.b = Math.max(Math.min(parseInt(split[4]), 255), 0);
        
        // Sets color to the specified amount
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                client.setColor(color); // Set color
                for (var j in client.cells) {
                    client.cells[j].setColor(color);
                }
                break;
            }
        }
    },
    exit: function(darkServer, split) {
        Logger.warn("Closing server...");
        darkServer.wsServer.close();
        process.exit(1);
    },
    kick: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        // kick player
        var count = 0;
        darkServer.m_Clients.forEach(function (socket) {
            if (socket.isConnected === false)
               return;
            if (id !== 0 && socket.playerTracker.pID != id)
                return;
            // remove player cells
            Commands.list.kill(darkServer, split);
            // disconnect
            socket.close(1000, "Kicked from server");
            var name = getName(socket.playerTracker._name);
            Logger.print("Kicked \"" + name + "\"");
            darkServer.sendChatMessage(null, null, "Kicked \"" + name + "\""); // notify to don't confuse with server bug
            count++;
        }, this);
        if (count) return;
        if (!id) Logger.warn("No players to kick!");
        else Logger.warn("Player with ID " + id + " not found!");
    },
    mute: function(darkServer, args) {
        if (!args || args.length < 2) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var id = parseInt(args[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var player = playerById(id, darkServer);
        if (!player) {
            Logger.warn("Player with id=" + id + " not found!");
            return;
        }
        if (player.isMuted) {
            Logger.warn("Player with id=" + id + " already muted!");
            return;
        }
        Logger.print("Player \"" + getName(player._name) + "\" was muted");
        player.isMuted = true;
    },
    unmute: function(darkServer, args) {
        if (!args || args.length < 2) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var id = parseInt(args[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var player = playerById(id, darkServer);
        if (player === null) {
            Logger.warn("Player with id=" + id + " not found!");
            return;
        }
        if (!player.isMuted) {
            Logger.warn("Player with id=" + id + " already not muted!");
            return;
        }
        Logger.print("Player \"" + getName(player._name) + "\" was unmuted");
        player.isMuted = false;
    },
    kickall: function(darkServer, split) {
        this.id = 0; //kick ALL players
        // kick player
        var count = 0;
        darkServer.m_Clients.forEach(function (socket) {
            if (socket.isConnected === false)
               return;
            if (this.id != 0 && socket.playerTracker.pID != this.id)
                return;
            // remove player cells
            Commands.list.killall(darkServer, split);
            // disconnect
            socket.close(1000, "Kicked from server");
            var name = getName(socket.playerTracker._name);
            Logger.print("Kicked \"" + name + "\"");
            darkServer.sendChatMessage(null, null, "Kicked \"" + name + "\""); // notify to don't confuse with server bug
            count++;
        }, this);
      
        if (count) return;
        if (!this.id) Logger.warn("No players to kick!");
        else Logger.warn("Player with ID " + this.id + " not found!");
    },
    kill: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var count = 0;
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                var len = client.cells.length;
                for (var j = 0; j < len; j++) {
                    darkServer.removeNode(client.cells[0]);
                    count++;
                }
                
                Logger.print("Killed " + getName(client._name) + " and removed " + count + " cells");
                break;
            }
        }
    },
    killall: function(darkServer, split) {
        var count = 0;
        for (var i = 0; i < darkServer.m_Clients.length; i++) {
            var playerTracker = darkServer.m_Clients[i].playerTracker;
            while (playerTracker.cells.length > 0) {
                darkServer.removeNode(playerTracker.cells[0]);
                count++;
            }
        }
        if (this.id) Logger.print("Removed " + count + " cells");
    },
    mass: function(darkServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var amount = parseInt(split[2]);
        if (isNaN(amount)) {
            Logger.warn("Please specify a valid number");
            return;
        }
        var size = Math.sqrt(amount * 100);
        
        // Sets mass to the specified amount
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                for (var j in client.cells) {
                    client.cells[j].setSize(size);
                }
                Logger.print("Set mass of " + getName(client._name) + " to " + (size * size / 100).toFixed(3));
                break;
            }
        }
    },
    spawnmass: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var amount = Math.max(parseInt(split[2]), 9);
        var size = Math.sqrt(amount * 100);
        if (isNaN(amount)) {
            Logger.warn("Please specify a valid mass!");
            return;
        }

        // Sets spawnmass to the specified amount
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                client.spawnmass = size;
                Logger.print("Set spawnmass of "+ getName(client._name) + " to " + (size * size / 100).toFixed(3));
            }
        }
    },   
    speed: function(darkServer, split) {
        var id = parseInt(split[1]);
        var speed = parseInt(split[2]);
        if (isNaN(id)) {
            Logger.print("Please specify a valid player ID!");
            return;
        }
        
        if (isNaN(speed)) {
            Logger.print("Please specify a valid speed!");
            return;
        }

        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                client.customspeed = speed;
                // override getSpeed function from PlayerCell
                Entity.PlayerCell.prototype.getSpeed = function (dist) {
                    var speed = 2.1106 / Math.pow(this._size, 0.449);
                    var normalizedDist = Math.min(dist, 32) / 32;
                    // tickStep = 40ms
                    this._speed = (this.owner.customspeed > 0) ? 
                    speed * 40 * this.owner.customspeed : // Set by command
                    speed * 40 * this.darkServer.config.playerSpeed;
                    return this._speed * normalizedDist;
                };
            }
        }
        Logger.print("Set base speed of " + getName(client._name) + " to " + speed);
    },
    merge: function(darkServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        // Find client with same ID as player entered
        for (var i = 0; i < darkServer.m_Clients.length; i++) {
            if (id == darkServer.m_Clients[i].playerTracker.pID) {
                var client = darkServer.m_Clients[i].playerTracker;
                if (client.cells.length == 1) {
                    Logger.warn("Client already has one cell!");
                    return;
                }
                // Set client's merge override
                client.mergeOverride = !client.mergeOverride;
                if (client.mergeOverride) Logger.print(getName(client._name) + " is now force merging");
                else Logger.print(getName(client._name) + " isn't force merging anymore");
            }
        }
    },
    rec: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        // set rec for client
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                client.rec = !client.rec;
                if (client.rec) Logger.print(getName(client._name) + " is now in rec mode!");
                else Logger.print(getName(client._name) + " is no longer in rec mode");
            }
        }
    },
    split: function(darkServer, split) {
        var id = parseInt(split[1]);
        var count = parseInt(split[2]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        if (isNaN(count)) {
            Logger.print("Split player 4 times");
            count = 4;
        }
        if (count > darkServer.config.playerMaxCells) {
            Logger.print("Split player to playerMaxCells");
            count = darkServer.config.playerMaxCells;
        }
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                for (var i = 0; i < count; i++) {
                    darkServer.splitCells(client);
                }
                Logger.print("Forced " + getName(client._name) + " to split " + count + " times");
                break;
            }
        }
    },
    name: function(darkServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var name = split.slice(2, split.length).join(' ');
        if (typeof name == 'undefined') {
            Logger.warn("Please type a valid name");
            return;
        }
        
        // Change name
        for (var i = 0; i < darkServer.m_Clients.length; i++) {
            var client = darkServer.m_Clients[i].playerTracker;
            
            if (client.pID == id) {
                Logger.print("Changing " + getName(client._name) + " to " + name);
                client.setName(name);
                return;
            }
        }
        
        // Error
        Logger.warn("Player " + id + " was not found");
    },
    skin: function(darkServer, args) {
        if (!args || args.length < 3) {
            Logger.warn("Please specify a valid player ID and skin name!");
            return;
        }
        var id = parseInt(args[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var skin = args[2].trim();
        if (!skin) {
            Logger.warn("Please specify skin name!");
        }
        var player = playerById(id, darkServer);
        if (!player) {
            Logger.warn("Player with id =" + id + " not found!");
            return;
        }
        if (player.cells.length) {
            Logger.warn("Player is alive, skin will not be applied to existing cells");
        }
        Logger.print("Player \"" + getName(player._name) + "\"'s skin is changed to " + skin);
        player.setSkin(skin);
    },
    unban: function(darkServer, split) {
        if (split.length < 2 || !split[1] || split[1].trim().length < 1) {
            Logger.warn("Please specify a valid IP!");
            return;
        }
        var ip = split[1].trim();
        var index = darkServer.ipBanList.indexOf(ip);
        if (index < 0) {
            Logger.warn("IP " + ip + " is not in the ban list!");
            return;
        }
        darkServer.ipBanList.splice(index, 1);
        saveIpBanList(darkServer);
        Logger.print("Unbanned IP: " + ip);
    },
    playerlist: function(darkServer, split) {
        if (!darkServer.m_Clients.length) return Logger.warn("No bots or players are currently connected to the server!");
        Logger.print("\nCurrent players: " + darkServer.m_Clients.length);
        Logger.print('Do "playerlist m" or "pl m" to list minions\n');
        Logger.print(" ID     | IP              | P | CELLS | SCORE  |   POSITION   | " + fillChar('NICK', ' ', darkServer.config.playerMaxNickLength) + " "); // Fill space
        Logger.print(fillChar('', '─', ' ID     | IP              | CELLS | SCORE  |   POSITION   |   |  '.length + darkServer.config.playerMaxNickLength));
        var sockets = darkServer.m_Clients.slice(0);
        sockets.sort(function (a, b) { return a.playerTracker.pID - b.playerTracker.pID; });
        for (var i = 0; i < sockets.length; i++) {
            var socket = sockets[i];
            var client = socket.playerTracker;
            var ip = client.isMi ? "[MINION]" : "[BOT]";
            var type = split[1];
            
            // list minions
            if (client.isMi) {
                if (type != "m") continue;
                else ip = "[MINION]";
            }
            
            // ID with 3 digits length
            var id = fillChar((client.pID), ' ', 6, true);
            
            // Get ip (15 digits length)
            if (socket.isConnected != null) {
                ip = socket.remoteAddress;
            }
            ip = fillChar(ip, ' ', 15);
            var protocol = darkServer.m_Clients[i].packetHandler.protocol;
            if (!protocol) protocol = "?";
            // Get name and data
            var nick = '',
                cells = '',
                score = '',
                position = '',
                data = '';
            if (socket.closeReason != null) {
                // Disconnected
                var reason = "[DISCONNECTED] ";
                if (socket.closeReason.code)
                    reason += "[" + socket.closeReason.code + "] ";
                if (socket.closeReason.message)
                    reason += socket.closeReason.message;
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + reason);
            } else if (!socket.packetHandler.protocol && socket.isConnected) {
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + "[CONNECTING]");
            } else if (client.spectate) {
                nick = "in free-roam";
                if (!client.freeRoam) {
                    var target = client.getSpectateTarget();
                    if (target != null) {
                        nick = getName(target._name);
                    }
                }
                data = fillChar("SPECTATING: " + nick, '-', ' | CELLS | SCORE  | POSITION    '.length + darkServer.config.playerMaxNickLength, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + data);
            } else if (client.cells.length) {
                nick = fillChar(getName(client._name), ' ', darkServer.config.playerMaxNickLength);
                cells = fillChar(client.cells.length, ' ', 5, true);
                score = fillChar(client._score >> 0, ' ', 6, true);
                position = fillChar(client.centerPos.x >> 0, ' ', 5, true) + ', ' + fillChar(client.centerPos.y >> 0, ' ', 5, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + cells + " | " + score + " | " + position + " | " + nick);
            } else {
                // No cells = dead player or in-menu
                data = fillChar('DEAD OR NOT PLAYING', '-', ' | CELLS | SCORE  | POSITION    '.length + darkServer.config.playerMaxNickLength, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + data);
            }
        }
    },
    pause: function(darkServer, split) {
        darkServer.run = !darkServer.run; // Switches the pause state
        var s = darkServer.run ? "Unpaused" : "Paused";
        Logger.print(s + " the game.");
    },
    freeze: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.print("Please specify a valid player ID!");
            return;
        }

        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                // set frozen state
                client.frozen = !client.frozen;
                if (client.frozen) Logger.print("Froze " + getName(client._name));
                else Logger.print("Unfroze " + getName(client._name));
            }
        }
    },
    reload: function(darkServer, split) {
        darkServer.loadConfig();
        darkServer.loadIpBanList();
        Logger.print("Reloaded the config file succesully");
    },
    status: function(darkServer, split) {
        var ini = require('./ini.js');
        // Get amount of humans/bots
        var humans = 0,
            bots = 0;
        for (var i = 0; i < darkServer.m_Clients.length; i++) {
            if ('_socket' in darkServer.m_Clients[i]) {
                humans++;
            } else {
                bots++;
            }
        }
        
        Logger.print("Connected players: " + darkServer.m_Clients.length + "/" + darkServer.config.serverMaxConnections);
        Logger.print("Players: " + humans + " - Bots: " + bots);
        Logger.print("Server has been running for " + Math.floor(process.uptime() / 60) + " minutes");
        Logger.print("Current memory usage: " + Math.round(process.memoryUsage().heapUsed / 1048576 * 10) / 10 + "/" + Math.round(process.memoryUsage().heapTotal / 1048576 * 10) / 10 + " mb");
        Logger.print("Current game mode: " + darkServer.darkMode.name);
        Logger.print("Current update time: " + darkServer.updateTimeAvg.toFixed(3) + " [ms]  (" + ini.getLagMessage(darkServer.updateTimeAvg) + ")");
    },
    tp: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        // Make sure the input values are numbers
        var pos = {
            x: parseInt(split[2]),
            y: parseInt(split[3])
        };
        if (isNaN(pos.x) || isNaN(pos.y)) {
            Logger.warn("Invalid coordinates");
            return;
        }
        
        // Spawn
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                for (var j in client.cells) {
                    client.cells[j].position.x = pos.x;
                    client.cells[j].position.y = pos.y;
                    darkServer.updateNodeQuad(client.cells[j]);
                }
                Logger.print("Teleported " + getName(client._name) + " to (" + pos.x + " , " + pos.y + ")");
                break;
            }
        }
    },
    spawn: function(darkServer, split) {
        var ent = split[1];
        if (ent != "virus" && ent != "food" && ent != "mothercell") {
            Logger.warn("Please specify either virus, food, or mothercell");
            return;
        }
    
        var pos = {
            x: parseInt(split[2]),
            y: parseInt(split[3])
        };
        var mass = parseInt(split[4]);
        
        // Make sure the input values are numbers
        if (isNaN(pos.x) || isNaN(pos.y)) {
            Logger.warn("Invalid coordinates");
            return;
        }
        
        // Start size for each entity 
        if (ent == "virus") {
            var size = darkServer.config.virusMinSize;
        } else if (ent == "mothercell") {
            size = darkServer.config.virusMinSize * 2.5;
        } else if (ent == "food") {
            size = darkServer.config.foodMinMass;
        }
        
        if (!isNaN(mass)) {
            size = Math.sqrt(mass * 100);
        }
        
        // Spawn for each entity
        if (ent == "virus") {
            var virus = new Entity.Virus(darkServer, null, pos, size);
            darkServer.addNode(virus);
            Logger.print("Spawned 1 virus at (" + pos.x + " , " + pos.y + ")");
        } else if (ent == "food") {
            var food = new Entity.Food(darkServer, null, pos, size);
            food.setColor(darkServer.getRandomColor());
            darkServer.addNode(food);
            Logger.print("Spawned 1 food cell at (" + pos.x + " , " + pos.y + ")");
        } else if (ent == "mothercell") {
            var mother = new Entity.MotherCell(darkServer, null, pos, size);
            darkServer.addNode(mother);
            Logger.print("Spawned 1 mothercell at (" + pos.x + " , " + pos.y + ")");
        }
    },
    replace: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var ent = split[2];
        if (ent != "virus" && ent != "food" && ent != "mothercell") {
            Logger.warn("Please specify either virus, food, or mothercell");
            return;
        }
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                while (client.cells.length > 0) {
                    var cell = client.cells[0];
                    darkServer.removeNode(cell);
                    // replace player with entity
                    if (ent == "virus") {
                        var virus = new Entity.Virus(darkServer, null, cell.position, cell._size);
                        darkServer.addNode(virus);
                        Logger.print("Replaced " + getName(client._name) + " with a virus");
                    } else if (ent == "food") {
                        var food = new Entity.Food(darkServer, null, cell.position, cell._size);
                        food.setColor(darkServer.getRandomColor());
                        darkServer.addNode(food);
                        Logger.print("Replaced " + getName(client._name) + " with a food cell");
                    } else if (ent == "mothercell") {
                        var mother = new Entity.MotherCell(darkServer, null, cell.position, cell._size);
                        darkServer.addNode(mother);
                        Logger.print("Replaced " + getName(client._name) + " with a mothercell");
                    }
                }
            }
        }
    },
    pop: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                var virus = new Entity.Virus(darkServer, null, client.centerPos, darkServer.config.virusMinSize);
                darkServer.addNode(virus);
                Logger.print("Popped " + getName(client._name));
            }
        }
    },
    explode: function(darkServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        for (var i in darkServer.m_Clients) {
            if (darkServer.m_Clients[i].playerTracker.pID == id) {
                var client = darkServer.m_Clients[i].playerTracker;
                for (var i = 0; i < client.cells.length; i++) {
                    var cell = client.cells[i];
                    while (cell._size > darkServer.config.playerMinSize) {
                        // remove mass from parent cell
                        var Agarian = 6.28 * Math.random();
                        var loss = darkServer.config.ejectSizeLoss;
                        var size = cell._sizeSquared - loss * loss;
                        cell.setSize(Math.sqrt(size));
                        // explode the cell
                        var pos = {
                            x: cell.position.x + Agarian,
                            y: cell.position.y + Agarian
                        };
                        var ejected = new Entity.EjectedMass(darkServer, null, pos, darkServer.config.ejectSize);
                        ejected.setColor(cell.color);
                        ejected.setBoost(780 * Math.random(), Agarian);
                        darkServer.addNode(ejected);
                    }
                    cell.setSize(darkServer.config.playerMinSize);
                }
                Logger.print("Successfully exploded " + getName(client._name));
            }
        }
    },
    lms: function(darkServer, split) {
        darkServer.disableSpawn = !darkServer.disableSpawn;
        var s = darkServer.disableSpawn ? "Started" : "Ended";
        Logger.print(s + " last man standing");
    },
    
    // Aliases for commands
    
    st: function(darkServer, split) { // Status
        Commands.list.status(darkServer, split);
    },
    pl: function(darkServer, split) { // Playerlist
        Commands.list.playerlist(darkServer, split);
    },
    m: function(darkServer, split) { // Mass
        Commands.list.mass(darkServer, split);
    },
    mn: function(darkServer, split) { // Minion
        Commands.list.minion(darkServer, split);
    },
    sm: function(darkServer, split) { // Spawnmass
        Commands.list.spawnmass(darkServer, split);
    },
    ka: function(darkServer, split) { // Killall
        Commands.list.killall(darkServer, split);
    },
    k: function(darkServer, split) { // Kill
        Commands.list.kill(darkServer, split);
    },
    mg: function(darkServer, split) { // Merge
        Commands.list.merge(darkServer, split);
    },
    s: function(darkServer, split) { // Speed
        Commands.list.speed(darkServer, split);
    },
    f: function(darkServer, split) { // Freeze
        Commands.list.freeze(darkServer, split);
    },
    ab: function(darkServer, split) { // Addbot
        Commands.list.addbot(darkServer, split); 
    },
    kb: function(darkServer, split) { // Kickbot
        Commands.list.kickbot(darkServer, split);
    },
    c: function(darkServer, split) { // Change
        Commands.list.change(darkServer, split);
    },
    n: function(darkServer, split) { // Name
        Commands.list.name(darkServer, split);
    },
    rep: function(darkServer, split) {
        Commands.list.replace(darkServer, split);
    },
    e: function(darkServer, split) {
        Commands.list.explode(darkServer, split);
    }
};

// functions from GameServer

function playerById(id, darkServer) {
    if (!id) return null;
    for (var i = 0; i < darkServer.m_Clients.length; i++) {
        var playerTracker = darkServer.m_Clients[i].playerTracker;
        if (playerTracker.pID == id) {
            return playerTracker;
        }
    }
    return null;
}

function saveIpBanList(darkServer) {
    var fs = require("fs");
    try {
        var blFile = fs.createWriteStream('../src/ipbanlist.txt');
        // Sort the blacklist and write.
        darkServer.ipBanList.sort().forEach(function (v) {
            blFile.write(v + '\n');
        });
        blFile.end();
        Logger.info(darkServer.ipBanList.length + " IP ban records saved.");
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to save " + '../src/ipbanlist.txt' + ": " + err.message);
    }
}

function ban(darkServer, split, ip) {
    var ipBin = ip.split('.');
    if (ipBin.length != 4) {
        Logger.warn("Invalid IP format: " + ip);
        return;
    }
    darkServer.ipBanList.push(ip);
    if (ipBin[2] == "*" || ipBin[3] == "*") {
        Logger.print("The IP sub-net " + ip + " has been banned");
    } else {
        Logger.print("The IP " + ip + " has been banned");
    }
    darkServer.m_Clients.forEach(function (socket) {
        // If already disconnected or the ip does not match
        if (!socket || !socket.isConnected || !darkServer.checkIpBan(socket.remoteAddress))
            return;
        // remove player cells
        Commands.list.kill(darkServer, split);
        // disconnect
        socket.close(null, "Banned from server");
        var name = getName(socket.playerTracker._name);
        Logger.print("Banned: \"" + name + "\" with Player ID " + socket.playerTracker.pID);
        darkServer.sendChatMessage(null, null, "Banned \"" + name + "\""); // notify to don't confuse with server bug
    }, darkServer);
    saveIpBanList(darkServer);
}

// functions from PlayerTracker

function getName(name) {
    if (!name.length) 
        name = "An unnamed cell";
    return name.trim();
}
