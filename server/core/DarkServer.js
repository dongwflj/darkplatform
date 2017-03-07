// Library imports
var WebSocket = require('ws');
var http = require('http');
var fs = require("fs");

// Project imports
var Packet = require('./packet');
var PlayerTracker = require('./PlayerTracker');
var PacketHandler = require('./PacketHandler');
var Entity = require('./entity');
var Logger = require('../modules/Logger');

// DarkServer implementation
function DarkServer() {
    // Location of source files - For renaming or moving source files!
    this.srcFiles = "../etc";
    
    // Startup
    this.run = true;
    this.version = '1.0.0';
    this.httpServer = null;
    this.commands = null;
    this.lastNodeId = 1;
    this.lastPlayerId = 1;
    this.m_Clients = [];
    this.socketCount = 0;
    this.largestClient = null; // Required for spectators
    this.nodes = [];        // Total nodes
    this.nodesVirus = [];   // Virus nodes
    this.nodesFood = [];    // Food nodes
    this.nodesEjected = []; // Ejected mass nodes
    
    this.movingNodes = []; // For move engine
    this.leaderboard = [];
    this.leaderboardType = -1; // no type
    
    var BotLoader = require('../ai/BotLoader');
    this.bots = new BotLoader(this);
    
    // Main loop tick
    this.startTime = Date.now();
    this.stepDateTime = 0;
    this.timeStamp = 0;
    this.updateTime = 0;
    this.updateTimeAvg = 0;
    this.timerLoopBind = null;
    this.mainLoopBind = null;
    this.tickCounter = 0;
    this.disableSpawn = false;

    // Config
    this.config = {
        logVerbosity: 4,            // Console log level (0=NONE; 1=FATAL; 2=ERROR; 3=WARN; 4=INFO; 5=DEBUG)
        logFileVerbosity: 4,        // File log level
        
        serverTimeout: 300,         // Seconds to keep connection alive for non-responding client
        serverWsModule: 'ws',       // WebSocket module: 'ws' or 'uws' (install npm package before using uws)
        serverMaxConnections: 500,  // Maximum number of connections to the server. (0 for no limit)
        serverPort: 443,            // Server port which will be used to listen for incoming connections
        serverBind: '0.0.0.0',      // Server network interface which will be used to listen for incoming connections (0.0.0.0 for all IPv4 interfaces)
        serverTracker: 0,           // Set to 1 if you want to show your server on the tracker http://ogar.mivabe.nl/master (check that your server port is opened for external connections first!)
        serverGamemode: 0,          // Gamemodes: 0 = FFA, 1 = Teams, 2 = Experimental, 3 = Rainbow
        serverBots: 0,              // Number of player bots to spawn (Experimental)
        serverViewBaseX: 1920,      // Base view distance of players. Warning: high values may cause lag! Min value is 1920x1080
        serverViewBaseY: 1080,      // min value is 1920x1080
        serverMinScale: 0.15,       // Minimum viewbox scale for player (low value leads to lags due to large visible area for big cell)
        serverSpectatorScale: 0.4,  // Scale (field of view) used for free roam spectators (low value leads to lags, vanilla = 0.4, old vanilla = 0.25)
        serverStatsPort: 88,        // Port for stats server. Having a negative number will disable the stats server.
        serverStatsUpdate: 60,      // Update interval of server stats in seconds
        mobilePhysics: 0,           // Whether or not the server uses mobile agar.io physics
        
        serverMaxLB: 10,            // Controls the maximum players displayed on the leaderboard.
        serverChat: 1,              // Allows the usage of server chat. 0 = no chat, 1 = use chat.
        serverChatAscii: 1,         // Set to 1 to disable non-ANSI letters in the chat (english only)
        serverName: 'Dark #1', // Server name
        serverWelcome1: 'Welcome to Dark Forest!',      // First server welcome message
        serverWelcome2: '',         // Second server welcome message (optional, for info, etc)
        clientBind: '',             // Only allow connections to the server from specified client (eg: http://agar.io - http://mywebsite.com - http://more.com) [Use ' - ' to seperate different websites]
        
        serverIpLimit: 4,           // Controls the maximum number of connections from the same IP (0 for no limit)
        serverMinionIgnoreTime: 30, // minion detection disable time on server startup [seconds]
        serverMinionThreshold: 10,  // max connections within serverMinionInterval time period, which l not be marked as minion
        serverMinionInterval: 1000, // minion detection interval [milliseconds]
        serverScrambleLevel: 0,     // Toggles scrambling of coordinates. 0 = No scrambling, 1 = lightweight scrambling. 2 = full scrambling (also known as scramble minimap); 3 - high scrambling (no border)
        playerBotGrow: 0,           // Cells greater than 625 mass cannot grow from cells under 17 mass (set to 1 to disable)
        
        borderWidth: 14142.135623730952,  // Map border size (Vanilla value: 14142)
        borderHeight: 14142.135623730952, // Map border size (Vanilla value: 14142)
        
        foodMinSize: 10,            // Minimum food size (vanilla 10)
        foodMaxSize: 20,            // Maximum food size (vanilla 20)
        foodMinAmount: 1000,        // Minimum food cells on the map
        foodMaxAmount: 2000,        // Maximum food cells on the map
        foodSpawnAmount: 30,        // The number of food to spawn per interval
        foodMassGrow: 1,            // Enable food mass grow ?
        spawnInterval: 20,          // The interval between each food cell spawn in ticks (1 tick = 40 ms)
        
        virusMinSize: 100,          // Minimum virus size. (vanilla: mass = val*val/100 = 100 mass)
        virusMaxSize: 141.421356237, // Maximum virus size (vanilla: mass = val*val/100 = 200 mass)
        virusMinAmount: 50,         // Minimum number of viruses on the map.
        virusMaxAmount: 100,        // Maximum number of viruses on the map. If this number is reached, then ejected cells will pass through viruses.
        motherCellMaxMass: 0,       // Maximum amount of mass a mothercell is allowed to have (0 for no limit)
        virusVelocity: 780,         // Velocity of moving viruses (speed and distance)
        
        ejectSize: 40,              // vanilla: mass = val*val/100 = 16 mass
        ejectSizeLoss: 45,          // Eject size which will be substracted from player cell (vanilla: mass = val*val/100 = 20 mass?)
        ejectCooldown: 3,           // Tick count until a player can eject mass again in ticks (1 tick = 40 ms)
        ejectSpawnPercent: 0.5,     // Chance for a player to spawn from ejected mass. 0.5 = 50% (set to 0 to disable)
        ejectVirus: 0,              // Whether or not players can eject viruses instead of mass
        ejectVelocity: 780,         // Velocity of ejecting cells (speed and distance)
        
        playerMinSize: 31.6227766017, // Minimum size a player cell can decay too. (vanilla: val*val/100 = 10 mass)
        playerMaxSize: 1500,        // Maximum size a player cell can achive before auto-splitting. (vanilla: mass = val*val/100 = 22500 mass)
        playerMinSplitSize: 60,     // Mimimum size a player cell has to be to split. (vanilla: mass = val*val/100 = 36 mass)
        playerMinEjectSize: 56.56854249, // Minimum size a player cell has to be to eject mass. (vanilla: mass = val*val/100 = 32 mass)
        playerStartSize: 31.6227766017, // Start size of the player cell. (vanilla: mass = val*val/100 = 10 mass)
        playerMaxCells: 16,         // Maximum cells a player is allowed to have.
        playerSpeed: 1,             // Player speed multiplier (1 = normal speed, 2 = twice the normal speed)
        playerDecayRate: 0.998,     // Amount of player cell size lost per second
        playerDecayCap: 0,          // Maximum mass a cell can have before it's decayrate multiplies by 10. (0 to disable)
        playerRecombineTime: 30,    // Base time in seconds before a cell is allowed to recombine
        playerMaxNickLength: 15,    // Maximum nick length
        playerDisconnectTime: 60,   // Time in seconds before a disconnected player's cells are removed (Set to -1 to never remove)
        splitVelocity: 780,         // Velocity of splitting cells (speed and distance)
        
        minionStartSize: 31.6227766017, // Start size of minions (mass = 32*32/100 = 10.24)
        minionMaxStartSize: 31.6227766017, // Maximum value of random start size for minions (set value higher than minionStartSize to enable)
        disableERTP: 1,             // Whether or not to disable ERTP controls for minions. (must use ERTPcontrol script in /scripts) (Set to 0 to enable)
        disableQ: 0,                // Whether or not to disable Q controls for minions. (Set 0 to enable)
        serverMinions: 0,           // Amount of minions each player gets once they spawn
        collectPellets: 0,          // Enable collect pellets mode. To use just press P or Q. (Warning: this disables Q controls, so make sure that disableERT is 0)
        defaultName: "minion",      // Default name for all minions if name is not specified using command (put <r> before the name for random skins!)
    };
    this.ipBanList = [];
    this.minionTest = [];
    this.userList = [];
    this.badWords = [];

    // Parse config
    this.loadConfig();
/*    this.loadIpBanList();
    this.loadUserList();
    this.loadBadWords();
*/    
    var QuadNode = require('../modules/QuadNode.js');
    this.setBorder(this.config.borderWidth, this.config.borderHeight);
    this.quadTree = new QuadNode(this.border, 64, 32);
    
    // Gamemodes
    var mode = require('../modes');
    this.darkMode = mode.get(this.config.serverGamemode);
}

module.exports = DarkServer;

DarkServer.prototype.start = function() {
    Logger.info("Start entry");
    this.timerLoopBind = this.timerLoop.bind(this);
    this.mainLoopBind = this.mainLoop.bind(this);
    this.darkMode.onServerInit(this); // Gamemode configurations
    
    // Client Binding
    var bind =  this.config.clientBind + "";
    this.clientBind = bind.split(' - ');
    
    // Start the server
    this.httpServer = http.createServer();
    var wsOptions = {
        server: this.httpServer, 
        perMessageDeflate: false,
        maxPayload: 4096
    };
    Logger.info("WebSocket: " + this.config.serverWsModule);
    Logger.info("Server bind: " + this.config.serverBind);
    WebSocket = require(this.config.serverWsModule);
    this.wsServer = new WebSocket.Server(wsOptions);
    this.wsServer.on('error', this.onServerSocketError.bind(this));
    this.wsServer.on('connection', this.onClientSocketOpen.bind(this));
    this.httpServer.listen(this.config.serverPort, this.config.serverBind, this.onHttpServerOpen.bind(this));
    if (this.config.serverStatsPort > 0) this.startStatsServer(this.config.serverStatsPort);
};

DarkServer.prototype.onHttpServerOpen = function() {
    // Start Main Loop
    setTimeout(this.timerLoopBind, 1);
    
    // Done
    Logger.info("Listening on port " + this.config.serverPort);
    Logger.info("Current mode is " + this.darkMode.name);
    
    // Player bots (Experimental)
    if (this.config.serverBots) {
        for (var i = 0; i < this.config.serverBots; i++) {
            this.bots.addBot();
        }
        Logger.info("Added " + this.config.serverBots + " player bots");
    }
};

DarkServer.prototype.addNode = function(node) {
    var x = node.position.x;
    var y = node.position.y;
    var size = node._size;
    node.quadItem = {
        cell: node, // update viewbox for players
        bound: { minx: x-size, miny: y-size, maxx: x+size, maxy: y+size }
    };
    this.quadTree.insert(node.quadItem);
    this.nodes.push(node);
    
    // Adds to the owning player's screen
    if (node.owner) {
        node.setColor(node.owner.color);
        node.owner.cells.push(node);
        node.owner.socket.sendPacket(new Packet.AddNode(node.owner, node));
    }
    node.onAdd(this); // Special on-add actions
};

DarkServer.prototype.onServerSocketError = function(error) {
    Logger.error("WebSocket: " + error.code + " - " + error.message);
    switch (error.code) {
        case "EADDRINUSE":
            Logger.error("Server could not bind to port " + this.config.serverPort + "!");
            Logger.error("Please close out of Skype or change 'serverPort' in gameserver.ini to a different number.");
            break;
        case "EACCES":
            Logger.error("Please make sure you are running Ogar with root privileges.");
            break;
    }
    process.exit(1); // Exits the program
};

DarkServer.prototype.onClientSocketOpen = function(ws) {
    var logip = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
    ws.on('error', function(err) {
        Logger.writeError("[Ws connect error:" + logip + "] " + err.stack);
    });
    if (this.config.serverMaxConnections && this.socketCount >= this.config.serverMaxConnections) {
        ws.close(1000, "No slots");
        return;
    }
    if (this.checkIpBan(ws._socket.remoteAddress)) {
        ws.close(1000, "IP banned");
        return;
    }
    if (this.config.serverIpLimit) {
        var ipConnections = 0;
        for (var i = 0; i < this.m_Clients.length; i++) {
            var socket = this.m_Clients[i];
            if (!socket.isConnected || socket.remoteAddress != ws._socket.remoteAddress)
                continue;
            ipConnections++;
        }
        if (ipConnections >= this.config.serverIpLimit) {
            ws.close(1000, "IP limit reached");
            return;
        }
    }
    if (this.config.clientBind.length && this.clientBind.indexOf(ws.upgradeReq.headers.origin) < 0) {
        ws.close(1000, "Client not allowed");
        return;
    }
    ws.isConnected = true;
    ws.remoteAddress = ws._socket.remoteAddress;
    ws.remotePort = ws._socket.remotePort;
    ws.lastAliveTime = Date.now();
    Logger.info("Client CONNECTED:" + ws.remoteAddress + ":" + ws.remotePort + ", origin: \"" + ws.upgradeReq.headers.origin + "\"");
    
    var PlayerCommand = require('../modules/PlayerCommand');
    ws.playerTracker = new PlayerTracker(this, ws);
    ws.packetHandler = new PacketHandler(this, ws);
    ws.playerCommand = new PlayerCommand(this, ws.playerTracker);
    
    var onMessage = function(message) {
        if (!message.length) {
            Logger.info("Client send empty message");
            return;
        }
        if (message.length > 256) {
            Logger.info("Client send message too long, close it");
            ws.close(1009, "Spam");
            return;
        }
        // Handle client's request
        ws.packetHandler.handleMessage(message);
    };
    var onError = function(error) {
        Logger.info("Client err:" + ws.remoteAddress);
        ws.sendPacket = function(data) { };
    };
    var self = this;
    var onClose = function(reason) {
        if (ws._socket.destroy != null && typeof ws._socket.destroy == 'function') {
            ws._socket.destroy();
        }
        self.socketCount--;
        ws.isConnected = false;
        ws.sendPacket = function(data) { };
        ws.closeReason = { reason: ws._closeCode, message: ws._closeMessage };
        ws.closeTime = Date.now();
        Logger.info("DISCONNECTED " + ws.remoteAddress + ":" + ws.remotePort + ", code: " + ws._closeCode + ", reason: \"" + ws._closeMessage + "\", name: \"" + ws.playerTracker._name + "\"");
    };
    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);
    this.socketCount++;
    this.m_Clients.push(ws);
    
    // Check for external minions
    this.checkMinion(ws);
};

DarkServer.prototype.checkMinion = function(ws) {
    // Check headers (maybe have a config for this?)
    if (!ws.upgradeReq.headers['user-agent'] || !ws.upgradeReq.headers['cache-control'] ||
        ws.upgradeReq.headers['user-agent'].length < 50) {
        ws.playerTracker.isMinion = true;
    }
    // External minion detection
    if (this.config.serverMinionThreshold) {
        if ((ws.lastAliveTime - this.startTime) / 1000 >= this.config.serverMinionIgnoreTime) {
            if (this.minionTest.length >= this.config.serverMinionThreshold) {
                ws.playerTracker.isMinion = true;
                for (var i = 0; i < this.minionTest.length; i++) {
                    var playerTracker = this.minionTest[i];
                    if (!playerTracker.socket.isConnected) continue;
                    playerTracker.isMinion = true;
                }
                if (this.minionTest.length) {
                    this.minionTest.splice(0, 1);
                }
            }
            this.minionTest.push(ws.playerTracker);
        }
    }
    // Add server minions if needed
    if (this.config.serverMinions && !ws.playerTracker.isMinion) {
        for (var i = 0; i < this.config.serverMinions; i++) {
            this.bots.addMinion(ws.playerTracker);
            ws.playerTracker.minionControl = true;
        }
    }
};

DarkServer.prototype.checkIpBan = function(ipAddress) {
    if (!this.ipBanList || !this.ipBanList.length || ipAddress == "127.0.0.1") {
        return false;
    }
    if (this.ipBanList.indexOf(ipAddress) >= 0) {
        return true;
    }
    var ipBin = ipAddress.split('.');
    if (ipBin.length != 4) {
        // unknown IP format
        return false;
    }
    var subNet2 = ipBin[0] + "." + ipBin[1] + ".*.*";
    if (this.ipBanList.indexOf(subNet2) >= 0) {
        return true;
    }
    var subNet1 = ipBin[0] + "." + ipBin[1] + "." + ipBin[2] + ".*";
    if (this.ipBanList.indexOf(subNet1) >= 0) {
        return true;
    }
    return false;
};

DarkServer.prototype.setBorder = function(width, height) {
    var hw = width / 2, hh = height / 2;
    this.border = {
        minx: -hw, miny: -hh, maxx: hw, maxy: hh, width: width, height: height, centerx: 0, centery: 0
    };
};

DarkServer.prototype.getRandomColor = function() {
    // get random
    var colorRGB = [0xFF, 0x07, (Math.random() * 256) >> 0];
    colorRGB.sort(function() {
        return 0.5 - Math.random();
    });
    // return random
    return {
        r: colorRGB[0],
        b: colorRGB[1],
        g: colorRGB[2]
    };
};

DarkServer.prototype.removeNode = function(node) {
    node.isRemoved = true;
    this.quadTree.remove(node.quadItem);
    node.quadItem = null;
    
    // Remove from main nodes list
    var index = this.nodes.indexOf(node);
    if (index != -1) {
        this.nodes.splice(index, 1);
    }
    
    // Remove from moving cells list
    index = this.movingNodes.indexOf(node);
    if (index != -1) {
        this.movingNodes.splice(index, 1);
    }
    
    // Special on-remove actions
    node.onRemove(this);
};

DarkServer.prototype.updateClients = function() {
    // check minions
    for (var i = 0; i < this.minionTest.length; ) {
        var date = new Date();
        if (this.stepDateTime - date > this.config.serverMinionInterval) {
            this.minionTest.splice(i, 1);
        } else {
            i++;
        }
    }
    // check and remove dead clients
    for (var i = 0; i < this.m_Clients.length; ) {
        var player = this.m_Clients[i].playerTracker;
        player.checkConnection();
        if (player.isRemoved) {
            // remove dead client
            this.m_Clients.splice(i, 1);
        } else {
            i++;
        }
    }
    // update
    for (var i = 0; i < this.m_Clients.length; i++) {
        this.m_Clients[i].playerTracker.updateTick();
    }
    for (var i = 0; i < this.m_Clients.length; i++) {
        this.m_Clients[i].playerTracker.sendUpdate();
    }
};

DarkServer.prototype.updateLeaderboard = function() {
    // Update leaderboard with the gamemode's method
    this.leaderboard = [];
    this.leaderboardType = -1;
    this.darkMode.updateLB(this);
    
    if (!this.darkMode.specByLeaderboard) {
        // Get client with largest score if gamemode doesn't have a leaderboard
        var m_Clients = this.m_Clients.valueOf();
        
        // Use sort function
        m_Clients.sort(function(a, b) {
            return b.playerTracker._score - a.playerTracker._score;
        });
        this.largestClient = null;
        if (m_Clients[0] !== null)
            this.largestClient = m_Clients[0].playerTracker;
    } else {
        this.largestClient = this.darkMode.rankOne;
    }
};

DarkServer.prototype.onChatMessage = function(from, to, message) {
    if (!message) return;
    message = message.trim();
    if (message === "") return;
    if (from && message.length > 0 && message[0] == '/') {
        // player command
        message = message.slice(1, message.length);
        from.socket.playerCommand.executeCommandLine(message);
        return;
    }
    if (!this.config.serverChat || (from && from.isMuted)) {
        // chat is disabled or player is muted
        return;
    }
    if (message.length > 64) {
        message = message.slice(0, 64);
    }
    if (this.config.serverChatAscii) {
        for (var i = 0; i < message.length; i++) {
            var c = message.charCodeAt(i);
            if (c < 0x20 || c > 0x7F) {
                if (from) {
                    this.sendChatMessage(null, from, "You can use ASCII text only!");
                }
                return;
            }
        }
    }
    if (this.checkBadWord(message)) {
        if (from) {
            this.sendChatMessage(null, from, "Stop insulting others! Keep calm and be friendly please");
        }
        return;
    }
    this.sendChatMessage(from, to, message);
};

DarkServer.prototype.checkBadWord = function(value) {
    if (!value) return false;
    value = value.toLowerCase().trim();
    if (!value) return false;
    for (var i = 0; i < this.badWords.length; i++) {
        if (value.indexOf(this.badWords[i]) >= 0) {
            return true;
        }
    }
    return false;
};

DarkServer.prototype.sendChatMessage = function(from, to, message) {
    for (var i = 0, len = this.m_Clients.length; i < len; i++) {
        var client = this.m_Clients[i];
        if (!client) continue;
        if (!to || to == client.playerTracker)
            client.sendPacket(new Packet.ChatMessage(from, message));
    }
};

DarkServer.prototype.timerLoop = function() {
    var timeStep = 40;
    var ts = Date.now();
    var dt = ts - this.timeStamp;
    if (dt < timeStep - 5) {
        //Mainloop only can be run after 40ms
        setTimeout(this.timerLoopBind, ((timeStep - 5) - dt) >> 0);
        return;
    }
    // if dl is too long, then we make timestamp faster
    if (dt > 120) this.timeStamp = ts - timeStep;
    // update average
    //this.updateTimeAvg += 0.5 * (this.updateTime - this.updateTimeAvg);
    if (this.updateTimeAvg == 0) {
        this.updateTimeAvg = this.updateTime;
    }
    else {
        this.updateTimeAvg = 0.5 * (this.updateTime + this.updateTimeAvg);
    }
    // calculate next
    if (!this.timeStamp)
        this.timeStamp = ts;
    this.timeStamp += timeStep;
    setTimeout(this.mainLoopBind, 0);
    setTimeout(this.timerLoopBind, 0);
};

DarkServer.prototype.mainLoop = function() {
    this.stepDateTime = Date.now();
    var tStart = process.hrtime();
    var self = this;
    
    // Loop main functions
    if (this.run) {
        // Move moving nodes first
        for (var i = 0, len = this.movingNodes.length; i < len; i++) {
            var cell1 = this.movingNodes[i];
            if (!cell1 || cell1.isRemoved) continue;
            this.moveCell(cell1);
            this.updateNodeQuad(cell1);
            if (!cell1.isMoving)
                this.movingNodes = null;
            // scan and check for ejected mass / virus collisions
            this.quadTree.find(cell1.quadItem.bound, function(item) {
                if (item.cell == cell1) return;
                var m = self.checkCellCollision(cell1, item.cell);
                if (cell1.cellType == 3 && item.cell.cellType == 3 && !self.config.mobilePhysics)
                    self.resolveRigidCollisionE(m);
                else
                    self.resolveCollision(m);
            });
        }
        // move cells and scan for collisions
        for (var i in this.m_Clients) {
            var player = this.m_Clients[i].playerTracker;
            for (var j = 0; j < player.cells.length; j++) {
                var cell1 = player.cells[j];
                if (cell1.isRemoved || !cell1 || !player)
                    continue;
                // move player cells
                this.updateRemerge(cell1, player);
                this.moveCell(cell1);
                this.movePlayer(cell1, player);
                this.autoSplit(cell1, player);
                this.updateNodeQuad(cell1);
                // Scan for player cells collisions
                this.quadTree.find(cell1.quadItem.bound, function(item) {
                    if (item.cell == cell1) return;
                    var m = self.checkCellCollision(cell1, item.cell);
                    if (self.checkRigidCollision(m) && m)
                        self.resolveRigidCollision(m);
                    else if (m)
                        self.resolveCollision(m);
                });
                // decay player cells once per second
                if (((this.tickCounter + 3) % 25) === 0) {
                    this.updateMassDecay(cell1);
                }
            }
        }
        if ((this.tickCounter % this.config.spawnInterval) === 0) {
            this.spawnCells(this.randomPos());
        }
        this.darkMode.onTick(this);
        this.tickCounter++;
    }
    this.updateClients();
    if (((this.tickCounter + 7) % 25) === 0) {
        // once per second
        this.updateLeaderboard();
    }
    // ping server tracker
    if (this.config.serverTracker && (this.tickCounter % 750) === 0) {
        // once per 30 seconds
        this.pingServerTracker();
    }
    // update-update time
    var tEnd = process.hrtime(tStart);
    this.updateTime = tEnd[0] * 1000 + tEnd[1] / 1000000;
};

// update remerge first
DarkServer.prototype.updateRemerge = function(cell1, player) {
    // update remerge
    var ttr = Math.max(this.config.playerRecombineTime, cell1._size * 0.2);
    if (cell1.getAge() < 13) cell1._canRemerge = false;
    if (!this.config.playerRecombineTime || player.rec) {
        cell1._canRemerge = cell1.boostDistance < 100;
        return; // instant merge
    }
    // seconds to ticks (tickStep = 0.040 sec => 1 / 0.040 = 25)
    ttr *= 25; // in seconds
    cell1._canRemerge = cell1.getAge() >= ttr;
};

// decay player cells
DarkServer.prototype.updateMassDecay = function(cell1) {
    var rate = this.config.playerDecayRate,
        cap = this.config.playerDecayCap,
        size = cell1._size;
    // check size/config rate
    if (!rate || size <= this.config.playerMinSize) 
        return;
    // get actual decay rate
    if (cap && cell1._mass > cap) rate *= 10;
    var decay = 1 - rate * this.darkMode.decayMod;
    // remove size from cell(s)
    size = Math.sqrt(size * size * decay);
    ///size = size * decay;
    size = Math.max(size, this.config.playerMinSize);
    cell1.setSize(size);
};

DarkServer.prototype.moveCell = function(cell1) {
    if (cell1.isMoving && !cell1.boostDistance) {
        cell1.boostDistance = 0;
        cell1.isMoving = false;
        return;
    }
    // add speed and set position
    var speed = cell1.boostDistance / 9; // val: 87
    cell1.boostDistance -= speed; // decays from speed
    cell1.position.x += cell1.boostDirection.x * speed;
    cell1.position.y += cell1.boostDirection.y * speed;
    
    // reflect off of border
    var r = cell1._size / 2;
    if (cell1.position.x < this.border.minx + r || cell1.position.x > this.border.maxx - r)
        cell1.boostDirection.x =- cell1.boostDirection.x;
	if (cell1.position.y < this.border.miny + r || cell1.position.y > this.border.maxy - r) 
	    cell1.boostDirection.y =- cell1.boostDirection.y;
    cell1.limitWithBorder(this.border);
};

DarkServer.prototype.movePlayer = function(cell1, client) {
    if (client.socket.isConnected == false || client.frozen) 
        return;
    // TODO: use vector for distance(s)
    // get distance
    var dx = ~~(client.mouse.x - cell1.position.x);
    var dy = ~~(client.mouse.y - cell1.position.y);
    var squared = dx * dx + dy * dy;
    if (squared < 1 || isNaN(dx) || isNaN(dy)) {
        return;
    }
    // get movement speed
    var d = Math.sqrt(squared);
    var speed = cell1.getSpeed(d);
    if (!speed) return; // avoid shaking
    // move player cells
    cell1.position.x += dx / d * speed;
    cell1.position.y += dy / d * speed;
};

DarkServer.prototype.autoSplit = function(cell1, player) {
    // square size limit if player is in rec mode
    if (!player.rec) var maxSize = this.config.playerMaxSize; 
    else maxSize = this.config.playerMaxSize * this.config.playerMaxSize;
    // check size limit
    if (!player.mergeOverride && cell1._size > maxSize) {
        if (player.cells.length >= this.config.playerMaxCells || this.config.mobilePhysics) {
            // cannot split => just limit
            cell1.setSize(maxSize);
            if (this.config.mobilePhysics) return;
        } else {
            // split
            var angle = Math.random() * 2 * Math.PI;
            ///this.splitPlayerCell(player, cell1, angle, cell1._mass / 2);
            this.splitPlayerCell(player, cell1, angle, cell1._mass / 2, this.config.playerMaxCells);
        }
    }
};

DarkServer.prototype.updateNodeQuad = function(node) {
    var item = node.quadItem;
    var x = node.position.x;
    var y = node.position.y;
    var size = node._size;
    // check for change
    if (item.x === x && item.y === y && item.size === size) {
        return;
    }
    // update quad tree
    item.x = x;
    item.y = y;
    item.size = size;
    item.bound.minx = x - size;
    item.bound.miny = y - size;
    item.bound.maxx = x + size;
    item.bound.maxy = y + size;
    this.quadTree.update(item);
};

// Checks cells for collision
DarkServer.prototype.checkCellCollision = function(cell, check) {
    var r = cell._size + check._size;
    var dx = check.position.x - cell.position.x;
    var dy = check.position.y - cell.position.y;
    var squared = dx * dx + dy * dy;
    var d = Math.sqrt(squared); // distance
    var push = Math.min((r - d) / d, r - d);
    // create collision manifold
    return {
        cell1: cell,
        cell2: check,
        r: r,               // radius sum
        dx: dx,             // delta x from cell1 to cell2
        dy: dy,             // delta y from cell1 to cell2
        d: d,               // distance from cell1 to cell2
        push: push,         // extrusion force from distance
        squared: squared    // squared distance from cell1 to cell2
    };
};

// Checks if collision is rigid body collision
DarkServer.prototype.checkRigidCollision = function(c) {
    if (!c.cell1.owner || !c.cell2.owner)
        return false;
    if (c.cell1.owner != c.cell2.owner) {
        // Different owners
        return this.darkMode.haveTeams && 
            c.cell1.owner.team == c.cell2.owner.team;
    }
    // The same owner
    if (c.cell1.owner.mergeOverride)
        return false;
    var r = (this.config.mobilePhysics) ? 1 : 13;
    if (c.cell1.getAge() < r || c.cell2.getAge() < r) {
        // just splited => ignore
        return false;
    }
    return !c.cell1._canRemerge || !c.cell2._canRemerge;
};

// Resolves rigid body collision
DarkServer.prototype.resolveRigidCollision = function(c) {
    if (c.d > c.r) return;
    // body impulse
    var m = c.cell1._mass + c.cell2._mass;
    var m1 = c.cell1._mass / m;
    var m2 = c.cell2._mass / m;
    // apply extrusion force
    c.cell1.position.x -= c.push * c.dx * m2;
    c.cell1.position.y -= c.push * c.dy * m2;
    c.cell2.position.x += c.push * c.dx * m1;
    c.cell2.position.y += c.push * c.dy * m1;
};

// Resolves rigid body collision for ejected cells
DarkServer.prototype.resolveRigidCollisionE = function(c) {
    if (c.d > c.r) return;
    // push ejected cells apart
    c.cell1.position.x -= c.push * c.dx * 0.4;
    c.cell1.position.y -= c.push * c.dy * 0.4;
};

// Resolves non-rigid body collision
DarkServer.prototype.resolveCollision = function(manifold) {
    var cell = manifold.cell1;
    var check = manifold.cell2;
    if (cell._size > check._size) {
        cell = manifold.cell2;
        check = manifold.cell1;
    }
    // check if any cell already eaten
    if (cell.isRemoved || check.isRemoved)
        return;
    // check distance
    var div = this.config.mobilePhysics ? 20 : 3;
    var eatDistance = check._size - cell._size / div;
    if (manifold.squared >= eatDistance * eatDistance) {
        return; // too far => can't eat
    }
    // collision owned => ignore, resolve, or remerge
    if (cell.owner && cell.owner == check.owner) {
        if (cell.getAge() < 13 || check.getAge() < 13)
            return; // just splited => ignore
    } else {
        if (check._size < cell._size * 1.11) return; // size check
        if (!check.canEat(cell)) return; // cell refuses to be eaten
    }
    // Now maxCell can eat minCell
    cell.isRemoved = true;
    
    // Consume effect
    check.onEat(cell);
    cell.onEaten(check);
    cell.killedBy = check;
  
    // update bounds & Remove cell
    this.updateNodeQuad(check);
    this.removeNode(cell);
};

DarkServer.prototype.splitPlayerCell = function(player, parent, angle, mass, m) {
    // Player cell limit
    if (player.cells.length >= m) return;
    
    if (mass === null) {
        //var size1 = parent._size / 1.41421356;
        var size1 = parent._size / 2;
    } else {
        /// New size
        var size2 = Math.sqrt(mass * 100);
        size1 = Math.sqrt(parent._size * parent._size - size2 * size2);
        Logger.debug("size1:"+size1+" size2:"+size2);
    }
    
    if (isNaN(size1) || size1 < this.config.playerMinSize) {
        return false;
    }
    
    // Remove mass from parent cell
    parent.setSize(size1);
    
    // make a small shift to the cell position to prevent extrusion in wrong direction
    var s = (this.config.mobilePhysics) ? size1 : 40;
    var pos = {
        x: parent.position.x + s * Math.sin(angle),
        y: parent.position.y + s * Math.cos(angle)
    };
    
    // Create cell
    var newCell = new Entity.PlayerCell(this, player, pos, size2 || size1);
    newCell.setBoost(this.config.splitVelocity, angle);
    
    // Add to node list
    this.addNode(newCell);
    return true;
};

DarkServer.prototype.randomPos = function() {
    return {
        x: this.border.minx + this.border.width * Math.random(),
        y: this.border.miny + this.border.height * Math.random()
    };
};

DarkServer.prototype.spawnCells = function(pos) {
    // spawn food at random size
    var maxCount = this.config.foodMinAmount - this.nodesFood.length;
    var spawnCount = Math.min(maxCount, this.config.foodSpawnAmount);
    for (var i = 0; i < spawnCount; i++) {
        var cell = new Entity.Food(this, null, this.randomPos(), this.config.foodMinSize);
        if (this.config.foodMassGrow) {
            var maxGrow = this.config.foodMaxSize - cell._size;
            cell.setSize(cell._size += maxGrow * Math.random());
        }
        cell.setColor(this.getRandomColor());
        this.addNode(cell);
    }
    // spawn viruses (safely)
    maxCount = this.config.virusMinAmount - this.nodesVirus.length;
    spawnCount = Math.min(maxCount, 2);
    for (var i = 0; i < spawnCount; i++) {
        if (this.willCollide(pos, this.config.virusMinSize)) {
            continue; // do not spawn
        }
        var v = new Entity.Virus(this, null, pos, this.config.virusMinSize);
        this.addNode(v);
    }
};

DarkServer.prototype.spawnPlayer = function(player, pos) {
    if (this.disableSpawn) return; // not allowed to spawn!
    
    // Check for special start size(s)
    var size = this.config.playerStartSize;
    if (player.spawnmass && !player.isMi) {
        size = player.spawnmass;
    } else if (player.isMi) {
        size = this.config.minionStartSize;
        if (this.config.minionMaxStartSize > size) {
            size = Math.random() * (this.config.minionMaxStartSize - size) + size;
        }
    }
    // Check if can spawn from ejected mass
    var index = (this.nodesEjected.length - 1) * ~~Math.random();
    var eject = this.nodesEjected[index];
    if (this.nodesEjected.length && !eject.isRemoved && eject.boostDistance < 1 &&
        Math.random() <= this.config.ejectSpawnPercent) {
        // Spawn as same color
        player.setColor(eject.color);
        // Spawn from ejected mass
        this.removeNode(eject);
        pos = {
            x: eject.position.x,
            y: eject.position.y
        };
        size = Math.max(eject._size, size);
    }
    // 10 attempts to find safe position
    /// Ewen: 
    /// for (var i = 0; i < 10 && this.willCollide(pos, size); i++) {
        pos = this.randomPos();
    ///}
    // Spawn player and add to world
    var cell = new Entity.PlayerCell(this, player, pos, size);
    this.addNode(cell);
    
    // Set initial mouse coords
    player.mouse = {
        x: pos.x,
        y: pos.y
    };
    
    // Remove external minions
    if (player.isMinion) {
        player.socket.close(1000, "isMinion");
        this.removeNode(cell);
    }
};

DarkServer.prototype.willCollide = function(pos, size) {
    // Look if there will be any collision with the current nodes
    var bound = {
        minx: pos.x - size,
        miny: pos.y - size,
        maxx: pos.x + size,
        maxy: pos.y + size
    };
    var sq = bound.minx * bound.minx + bound.miny * bound.miny;
    if (sq + (size * size) <= (size * 2)) {
        return null; // not safe => try again
    }
    return this.quadTree.any(
        bound, function(item) {
            return item.cell.cellType != 3; // don't check ejected
        });
};

DarkServer.prototype.splitCells = function(player) {
    /// Ewen
    if (player.cells.length >= this.config.playerMaxCells) {
        Logger.debug("Player has too much cell:" + player.cells.length);
        return;
    }
    var cellToSplit = []; // Split cell order decided by cell age
    for (var i = 0; i < player.cells.length; i++) {
        if (player.cells[i]._size < this.config.playerMinSplitSize) {
            /// ignore small cell which can't split
            continue;
        }
        cellToSplit.push(player.cells[i]);
        // rec mode
        if (!player.rec) var maxCell = this.config.playerMaxCells;
        else maxCell = this.config.playerMaxCells * this.config.playerMaxCells;
        // cannot split
        if (cellToSplit.length + player.cells.length >= maxCell)
            break;
    }
    for (var i = 0; i < cellToSplit.length; i++) {
        var cell = cellToSplit[i];
        var x = ~~(player.mouse.x - cell.position.x);
        var y = ~~(player.mouse.y - cell.position.y);
        if (x * x + y * y < 1) {
            x = 1, y = 0;
        }
        var angle = Math.atan2(x, y);
        if (isNaN(angle)) angle = Math.PI / 2;
        this.splitPlayerCell(player, cell, angle, null, maxCell);
    }
};

DarkServer.prototype.canEjectMass = function(player) {
    if (player.lastEject === null) {
        // first eject
        player.lastEject = this.tickCounter;
        return true;
    }
    var dt = this.tickCounter - player.lastEject;
    if (dt < this.config.ejectCooldown) {
        // reject (cooldown)
        return false;
    }
    player.lastEject = this.tickCounter;
    return true;
};

DarkServer.prototype.ejectMass = function(player) {
    if (!this.canEjectMass(player) || player.frozen)
        return;
    for (var i = 0; i < player.cells.length; i++) {
        var cell = player.cells[i];
        
        if (!cell || cell._size < this.config.playerMinEjectSize) {
            continue;
        }
        
        var dx = player.mouse.x - cell.position.x;
        var dy = player.mouse.y - cell.position.y;
        var dl = dx * dx + dy * dy;
        var sq = Math.sqrt(dl);
        if (dl > 1) {
            dx /= sq;
            dy /= sq;
        } else {
            dx = 1;
            dy = 0;
        }
        
        // Remove mass from parent cell first
        var sizeLoss = this.config.ejectSizeLoss;
        var size = cell._size - sizeLoss;
        cell.setSize(size);
        ///var sizeSquared = cell._sizeSquared - sizeLoss * sizeLoss;
        ///var sizeSquared = cell._sizeSquared - sizeLoss;
        ///cell.setSize(Math.sqrt(sizeSquared));
        
        // Get starting position
        var pos = {
            x: cell.position.x + dx * cell._size,
            y: cell.position.y + dy * cell._size
        };
        var angle = Math.atan2(dx, dy);
        if (isNaN(angle)) angle = Math.PI / 2;
        
        // Randomize angle don't need this
        /// angle += (Math.random() * 0.6) - 0.3;
        
        // Create cell
        if (!this.config.ejectVirus) {
            var ejected = new Entity.EjectedMass(this, null, pos, this.config.ejectSize);
        } else {
            ejected = new Entity.Virus(this, null, pos, this.config.ejectSize);
        }
        ejected.setColor(cell.color);
        ejected.setBoost(this.config.ejectVelocity, angle);
        this.addNode(ejected);
    }
};

DarkServer.prototype.shootVirus = function(parent, angle) {
    var pos = {
        x: parent.position.x,
        y: parent.position.y,
    };
    var newVirus = new Entity.Virus(this, null, pos, this.config.virusMinSize);
    newVirus.setBoost(this.config.virusVelocity, angle);
    
    // Add to moving cells list
    this.addNode(newVirus);
};

DarkServer.prototype.loadConfig = function() {
    var fileNameConfig = './etc/server.ini';
    var ini = require('../modules/ini.js');
    try {
        if (!fs.existsSync(fileNameConfig)) {
            // No config
            Logger.warn("Config not found... Generating new config");
            // Create a new config
            fs.writeFileSync(fileNameConfig, ini.stringify(this.config), 'utf-8');
        } else {
            // Load the contents of the config file
            var load = ini.parse(fs.readFileSync(fileNameConfig, 'utf-8'));
            // Replace all the default config's values with the loaded config's values
            for (var key in load) {
                if (this.config.hasOwnProperty(key)) {
                    this.config[key] = load[key];
                } else {
                    Logger.error("Unknown gameserver.ini value: " + key);
                }
            }
        }
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameConfig + ": " + err.message);
    }
    // check config (min player size = 32 => mass = 10.24)
    this.config.playerMinSize = Math.max(32, this.config.playerMinSize);
    Logger.setVerbosity(this.config.logVerbosity);
    Logger.setFileVerbosity(this.config.logFileVerbosity);
};

DarkServer.prototype.loadBadWords = function() {
    var fileNameBadWords = this.srcFiles + '/badwords.txt';
    try {
        if (!fs.existsSync(fileNameBadWords)) {
            Logger.warn(fileNameBadWords + " not found");
        } else {
            var words = fs.readFileSync(fileNameBadWords, 'utf-8');
            words = words.split(/[\r\n]+/);
            words = words.map(function(arg) { return arg.trim().toLowerCase(); });
            words = words.filter(function(arg) { return !!arg; });
            this.badWords = words;
            Logger.info(this.badWords.length + " bad words loaded");
        }
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameBadWords + ": " + err.message);
    }
};

DarkServer.prototype.loadUserList = function() {
    var UserRoleEnum = require(this.srcFiles + '/enum/UserRoleEnum');
    var fileNameUsers = this.srcFiles + '/enum/userRoles.json';
    try {
        this.userList = [];
        if (!fs.existsSync(fileNameUsers)) {
            Logger.warn(fileNameUsers + " is missing.");
            return;
        }
        var usersJson = fs.readFileSync(fileNameUsers, 'utf-8');
        var list = JSON.parse(usersJson.trim());
        for (var i = 0; i < list.length; ) {
            var item = list[i];
            if (!item.hasOwnProperty("ip") ||
                !item.hasOwnProperty("password") ||
                !item.hasOwnProperty("role") ||
                !item.hasOwnProperty("name")) {
                list.splice(i, 1);
                continue;
            }
            if (!item.password || !item.password.trim()) {
                Logger.warn("User account \"" + item.name + "\" disabled");
                list.splice(i, 1);
                continue;
            }
            if (item.ip) {
                item.ip = item.ip.trim();
            }
            item.password = item.password.trim();
            if (!UserRoleEnum.hasOwnProperty(item.role)) {
                Logger.warn("Unknown user role: " + item.role);
                item.role = UserRoleEnum.USER;
            } else {
                item.role = UserRoleEnum[item.role];
            }
            item.name = (item.name || "").trim();
            i++;
        }
        this.userList = list;
        Logger.info(this.userList.length + " user records loaded.");
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameUsers + ": " + err.message);
    }
};

DarkServer.prototype.loadIpBanList = function() {
    var fileNameIpBan = this.srcFiles + '/ipbanlist.txt';
    try {
        if (fs.existsSync(fileNameIpBan)) {
            // Load and input the contents of the ipbanlist file
            this.ipBanList = fs.readFileSync(fileNameIpBan, "utf8").split(/[\r\n]+/).filter(function(x) {
                return x !== ''; // filter empty lines
            });
            Logger.info(this.ipBanList.length + " IP ban records loaded.");
        } else {
            Logger.warn(fileNameIpBan + " is missing.");
        }
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameIpBan + ": " + err.message);
    }
};

// Custom prototype function
WebSocket.prototype.sendPacket = function(packet) {
    if (!packet) return;
    if (this.readyState == WebSocket.OPEN) {
        if (this._socket.writable != null && !this._socket.writable) {
            return;
        }
        var buffer = packet.build(this.playerTracker.socket.packetHandler.protocol);
        if (buffer != null) {
            this.send(buffer, { binary: true });
        }
    } else {
        this.readyState = WebSocket.CLOSED;
        this.emit('close');
    }
};

DarkServer.prototype.startStatsServer = function(port) {
    // Create stats
    this.stats = "Test";
    this.getStats();
    
    // Show stats
    this.httpServer = http.createServer(function(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(this.stats);
    }.bind(this));
    this.httpServer.on('error', function(err) {
        Logger.error("Stats Server: " + err.message);
    });
    
    var getStatsBind = this.getStats.bind(this);
    this.httpServer.listen(port, function() {
        // Stats server
        Logger.info("Started stats server on port " + port);
        setInterval(getStatsBind, this.config.serverStatsUpdate * 1000);
    }.bind(this));
};

DarkServer.prototype.getStats = function() {
    // Get server statistics
    var totalPlayers = 0;
    var alivePlayers = 0;
    var spectatePlayers = 0;
    for (var i = 0; i < this.m_Clients.length; i++) {
        var socket = this.m_Clients[i];
        if (!socket || !socket.isConnected)
            continue;
        totalPlayers++;
        if (socket.playerTracker.cells.length > 0)
            alivePlayers++;
        else
            spectatePlayers++;
    }
    var s = {
        'server_name': this.config.serverName,
        'server_chat': this.config.serverChat ? "true" : "false",
        'border_width': this.border.width,
        'border_height': this.border.height,
        'gamemode': this.darkMode.name,
        'max_players': this.config.serverMaxConnections,
        'current_players': totalPlayers,
        'alive': alivePlayers,
        'spectators': spectatePlayers,
        'update_time': this.updateTimeAvg.toFixed(3),
        'uptime': Math.round((this.stepDateTime - this.startTime) / 1000 / 60),
        'start_time': this.startTime
    };
    this.stats = JSON.stringify(s);
};

// Pings the server tracker, should be called every 30 seconds
// To list us on the server tracker located at http://ogar.mivabe.nl/master
DarkServer.prototype.pingServerTracker = function() {
    // Get server statistics
    var os = require('os');
    var totalPlayers = 0;
    var alivePlayers = 0;
    var spectatePlayers = 0;
    var robotPlayers = 0;
    for (var i = 0; i < this.m_Clients.length; i++) {
        var socket = this.m_Clients[i];
        if (!socket || socket.isConnected == false)
            continue;
        if (socket.isConnected == null) {
            robotPlayers++;
        }
        else {
            totalPlayers++;
            if (socket.playerTracker.cells.length > 0)
                alivePlayers++;
            else
                spectatePlayers++;
        }
    }

    // ogar-tracker.tk
    var obj = {
        port: this.config.serverPort,               // [mandatory] web socket port which listens for game client connections
        name: this.config.serverName,               // [mandatory] server name
        mode: this.darkMode.name,                   // [mandatory] game mode
        total: totalPlayers,                        // [mandatory] total online players (server bots is not included!)
        alive: alivePlayers,                        // [mandatory] alive players (server bots is not included!)
        spect: spectatePlayers,                     // [mandatory] spectate players (server bots is not included!)
        robot: robotPlayers,                        // [mandatory] server bots
        limit: this.config.serverMaxConnections,    // [mandatory] maximum allowed connection count
        protocol: 'M',                              // [mandatory] required protocol id or 'M' for multiprotocol (if all protocols is supported)   
        uptime: process.uptime() >> 0,              // [mandatory] server uptime [seconds]
        w: this.border.width >> 0,                  // [mandatory] map border width [integer]
        h: this.border.height >> 0,                 // [mandatory] map border height [integer]
        version: 'MultiOgar-Edited ' + this.version,       // [optional]  server version
        stpavg: this.updateTimeAvg >> 0,            // [optional]  average server loop time
        chat: this.config.serverChat ? 1 : 0,       // [optional]  0 - chat disabled, 1 - chat enabled
        os: os.platform()                           // [optional]  operating system
    };
    trackerRequest({
        host: 'ogar-tracker.tk',
        port: 80,
        path: '/api/ping',
        method: 'PUT'
    }, 'application/json', JSON.stringify(obj));
    

    // mivabe.nl
    var data = 'current_players=' + totalPlayers +
               '&alive=' + alivePlayers +
               '&spectators=' + spectatePlayers +
               '&max_players=' + this.config.serverMaxConnections +
               '&sport=' + this.config.serverPort +
               '&gamemode=[**] ' + this.darkMode.name +             // we add [**] to indicate that this is MultiOgar-Edited server
               '&agario=true' +                                     // protocol version
               '&name=Unnamed Server' +                             // we cannot use it, because other value will be used as dns name
               '&opp=' + os.platform() + ' ' + os.arch() +          // "win32 x64"
               '&uptime=' + process.uptime() +                      // Number of seconds server has been running
               '&version=MultiOgar-Edited ' + this.version +
               '&start_time=' + this.startTime;
    trackerRequest({
        host: 'ogar.mivabe.nl',
        port: 80,
        path: '/master',
        method: 'POST'
    }, 'application/x-www-form-urlencoded', data);
    
    // c0nsume.me
    trackerRequest({
        host: 'c0nsume.me',
        port: 80,
        path: '/tracker.php',
        method: 'POST'
    }, 'application/x-www-form-urlencoded', data);
};

function trackerRequest(options, type, body) {
    if (options.headers == null) options.headers = {};
    options.headers['user-agent'] = 'MultiOgar-Edited' + this.version;
    options.headers['content-type'] = type;
    options.headers['content-length'] = body == null ? 0 : Buffer.byteLength(body, 'utf8');
    var req = http.request(options, function(res) {
        if (res.statusCode != 200) {
            Logger.writeError("[Tracker][" + options.host + "]: statusCode = " + res.statusCode);
            return;
        }
        res.setEncoding('utf8');
    });
    req.on('error', function(err) {
        Logger.writeError("[Tracker][" + options.host + "]: " + err);
    });
    req.shouldKeepAlive = false;
    req.on('close', function() {
        req.destroy();
    });
    req.write(body);
    req.end();
}
