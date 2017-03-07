// Project imports
var FakeSocket = require('./FakeSocket');
var PacketHandler = require('../core/PacketHandler');

function BotLoader(darkServer) {
    this.darkServer = darkServer;
    this.loadNames();
}

module.exports = BotLoader;

BotLoader.prototype.getName = function () {
    var name = "";
    
    // Picks a random name for the bot
    if (this.randomNames.length > 0) {
        var index = (this.randomNames.length * Math.random()) >>> 0;
        name = this.randomNames[index];
    } else {
        name = "Ai" + ++this.nameIndex;
    }
    
    return name;
};

BotLoader.prototype.loadNames = function () {
    this.randomNames = [];
    var fs = require("fs");
    
    if (fs.existsSync("../src/ai/BotNames.txt")) {
        // Read and parse the names - filter out whitespace-only names
        this.randomNames = fs.readFileSync("../src/ai/BotNames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty names
        });
    }
    this.nameIndex = 0;
};

BotLoader.prototype.addBot = function () {
    var BotPlayer = require('./BotPlayer');
    var s = new FakeSocket(this.darkServer);
    s.playerTracker = new BotPlayer(this.darkServer, s);
    s.packetHandler = new PacketHandler(this.darkServer, s);
    
    // Add to client list
    this.darkServer.m_Clients.push(s);
    
    // Add to world
    s.packetHandler.setNickname(this.getName());
};

BotLoader.prototype.addMinion = function(owner, name) {
    var MinionPlayer = require('./MinionPlayer');
    var s = new FakeSocket(this.darkServer);
    s.playerTracker = new MinionPlayer(this.darkServer, s, owner);
    s.packetHandler = new PacketHandler(this.darkServer, s);
    s.playerTracker.owner = owner;
    
    // Add to client list
    this.darkServer.clients.push(s);

    // Add to world & set name
    if (typeof name == "undefined" || name == "") {
        name = this.darkServer.config.defaultName;
    }
    s.packetHandler.setNickname(name);
};
