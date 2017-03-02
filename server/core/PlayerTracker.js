var Packet = require('./packet');
var BinaryWriter = require("./packet/BinaryWriter");

function PlayerTracker(darkServer, socket) {
    this.darkServer = darkServer;
    this.socket = socket;
    this.pID = -1;
    this.userAuth = null;
    this.isRemoved = false;
    this.isCloseRequested = false;
    this._name = "";
    this._skin = "";
    this._nameUtf8 = null;
    this._nameUnicode = null;
    this._skinUtf8 = null;
    this.color = { r: 0, g: 0, b: 0 };
    this.viewNodes = [];
    this.clientNodes = [];
    this.cells = [];
    this.mergeOverride = false; // Triggered by console command
    this._score = 0; // Needed for leaderboard
    this._scale = 1;
    this.isMassChanged = true;
    this.borderCounter = 0;
    
    this.tickLeaderboard = 0;
    this.team = 0;
    this.spectate = false;
    this.freeRoam = false;      // Free-roam mode enables player to move in spectate mode
    this.spectateTarget = null; // Spectate target, null for largest player
    this.lastKeypressTick = 0;
    
    this.centerPos = {
        x: 0,
        y: 0
    };
    this.mouse = {
        x: 0,
        y: 0
    };
    this.viewBox = {
        minx: 0,
        miny: 0,
        maxx: 0,
        maxy: 0,
        halfWidth: 0,
        halfHeight: 0
    };
    
    // Scramble the coordinate system for anti-raga
    this.scrambleX = 0;
    this.scrambleY = 0;
    this.scrambleId = 0;
    this.isMinion = false;
    this.isMuted = false;
    
    // Custom commands
    this.spawnmass = 0;
    this.frozen = false;
    this.customspeed = 0;
    this.rec = false;
    
    // Minions
    this.miQ = 0;
    this.isMi = false;
    this.minionSplit = false;
    this.minionEject = false;
    this.minionFrozen = false;
    this.minionControl = false;
    this.collectPellets = false;
    
    // Gamemode function
    if (darkServer) {
        this.centerPos.x = darkServer.border.centerx;
        this.centerPos.y = darkServer.border.centery;
        // Player id
        this.pID = darkServer.lastPlayerId++ >> 0;
        // Gamemode function
        darkServer.darkMode.onPlayerInit(this);
        // Only scramble if enabled in config
        this.scramble();
    }
    var UserRoleEnum = require("../enum/UserRoleEnum");
    this.userRole = UserRoleEnum.GUEST;
}

module.exports = PlayerTracker;

// Setters/Getters

PlayerTracker.prototype.scramble = function() {
    if (!this.darkServer.config.serverScrambleLevel) {
        this.scrambleId = 0;
        this.scrambleX = 0;
        this.scrambleY = 0;
    } else {
        this.scrambleId = (Math.random() * 0xFFFFFFFF) >>> 0;
        // avoid mouse packet limitations
        var maxx = Math.max(0, 31767 - this.darkServer.border.width);
        var maxy = Math.max(0, 31767 - this.darkServer.border.height);
        var x = maxx * Math.random();
        var y = maxy * Math.random();
        if (Math.random() >= 0.5) x = -x;
        if (Math.random() >= 0.5) y = -y;
        this.scrambleX = x;
        this.scrambleY = y;
    }
    this.borderCounter = 0;
};

PlayerTracker.prototype.setName = function(name) {
    this._name = name;
    if (!name || !name.length) {
        this._nameUnicode = null;
        this._nameUtf8 = null;
        return;
    }
    var writer = new BinaryWriter();
    writer.writeStringZeroUnicode(name);
    this._nameUnicode = writer.toBuffer();
    writer = new BinaryWriter();
    writer.writeStringZeroUtf8(name);
    this._nameUtf8 = writer.toBuffer();
};

PlayerTracker.prototype.setSkin = function(skin) {
    this._skin = skin;
    if (!skin || !skin.length) {
        this._skinUtf8 = null;
        return;
    }
    var writer = new BinaryWriter();
    writer.writeStringZeroUtf8(skin);
    this._skinUtf8 = writer.toBuffer();
};

PlayerTracker.prototype.setColor = function(color) {
    this.color.r = color.r;
    this.color.g = color.g;
    this.color.b = color.b;
};

PlayerTracker.prototype.getScale = function() {
    if (this.isMassChanged) this.updateMass();
    return this._scale;
};

PlayerTracker.prototype.updateMass = function() {
    this._score = 0; // reset to not cause bugs with playerlist
    for (var i = 0; i < this.cells.length; i++) {
        var node = this.cells[i];
        if (node === null) continue;
        this._scale += node._size;
        this._score += node._mass;
    }
    if (!this._scale) {
        this._score = 0; // do not change score if no scale
    } else {
        this._scale = Math.pow(Math.min(64 / this._scale, 1), 0.4);
    }
    this.isMassChanged = false;
};

PlayerTracker.prototype.joinGame = function(name, skin) {
    if (this.cells.length) return;
    if (skin) this.setSkin(skin);
    if (name === null) name = "An unnamed cell";
    this.setName(name);
    this.spectate = false;
    this.freeRoam = false;
    this.spectateTarget = null;
    
    // some old clients don't understand ClearAll message
    // so we will send update for them
    if (this.socket.packetHandler.protocol < 6) {
        this.socket.sendPacket(new Packet.UpdateNodes(this, [], [], [], this.clientNodes));
    }
    this.socket.sendPacket(new Packet.ClearAll());
    this.clientNodes = [];
    this.scramble();
    if (this.darkServer.config.serverScrambleLevel < 2) {
        // no scramble / lightweight scramble
        this.socket.sendPacket(new Packet.SetBorder(this, this.darkServer.border));
    }
    else if (this.darkServer.config.serverScrambleLevel == 3) {
        var ran = 10065536 * Math.random();
        // Ruins most known minimaps (no border)
        var border = {
            minx: this.darkServer.border.minx - ran,
            miny: this.darkServer.border.miny - ran,
            maxx: this.darkServer.border.maxx + ran,
            maxy: this.darkServer.border.maxy + ran
        };
        this.socket.sendPacket(new Packet.SetBorder(this, border));
    }
    this.darkServer.darkMode.onPlayerSpawn(this.darkServer, this);
};

PlayerTracker.prototype.checkConnection = function() {
    // Handle disconnection
    if (!this.socket.isConnected) {
        // wait for playerDisconnectTime
        var dt = (this.darkServer.stepDateTime - this.socket.closeTime) / 1000;
        if (!this.cells.length || dt >= this.darkServer.config.playerDisconnectTime) {
            // Remove all client cells
            var cells = this.cells;
            this.cells = [];
            for (var i = 0; i < cells.length; i++) {
                this.darkServer.removeNode(cells[i]);
            }
            // Mark to remove
            this.isRemoved = true;
            return;
        }
        this.mouse.x = this.centerPos.x;
        this.mouse.y = this.centerPos.y;
        this.socket.packetHandler.pressSpace = false;
        this.socket.packetHandler.pressQ = false;
        this.socket.packetHandler.pressW = false;
        return;
    }
    // Check timeout
    if (!this.isCloseRequested && this.darkServer.config.serverTimeout) {
        dt = (this.darkServer.stepDateTime - this.socket.lastAliveTime) / 1000;
        if (dt >= this.darkServer.config.serverTimeout) {
            this.socket.close(1000, "Connection timeout");
            this.isCloseRequested = true;
        }
    }
};

PlayerTracker.prototype.updateTick = function() {
    if (this.isRemoved) return;
    this.socket.packetHandler.process();
    if (this.darkServer.clients.length > 800 && this.isMi) return;
    if (this.spectate) {
        if (this.freeRoam || this.getSpectateTarget() == null) {
            // free roam
            this.updateCenterFreeRoam();
            this._scale = this.darkServer.config.serverSpectatorScale; // 0.25;
        } else {
            // spectate target
            return;
        }
    } else {
        // in game
        this.updateCenterInGame();
    }
    // update viewbox
    var scale = Math.max(this.getScale(), this.darkServer.config.serverMinScale);
    var halfWidth = (this.darkServer.config.serverViewBaseX / scale) / 2;
    var halfHeight = (this.darkServer.config.serverViewBaseY / scale) / 2;
    this.viewBox = {
        minx: this.centerPos.x - halfWidth,
        miny: this.centerPos.y - halfHeight,
        maxx: this.centerPos.x + halfWidth,
        maxy: this.centerPos.y + halfHeight,
        halfWidth: halfWidth,
        halfHeight: halfHeight
    };
    
    // update visible nodes
    this.viewNodes = [];
    if (!this.isMinion || !this.isMi) {
        var self = this;
        this.darkServer.quadTree.find(this.viewBox, function(quadItem) {
            if (quadItem.cell.owner != self)
                self.viewNodes.push(quadItem.cell);
        });
    }
    this.viewNodes = this.viewNodes.concat(this.cells);
    this.viewNodes.sort(function(a, b) { return a.nodeId - b.nodeId; });
};

PlayerTracker.prototype.sendUpdate = function() {
    if (this.isRemoved || !this.socket.packetHandler.protocol ||
        !this.socket.isConnected || this.isMi || this.isMinion ||
        (this.socket._socket.writable !== null && !this.socket._socket.writable) || 
        this.socket.readyState != this.socket.OPEN) {
        // do not send update for disconnected clients
        // also do not send if initialization is not complete yet
        return;
    }
    
    if (this.spectate) {
        if (!this.freeRoam) {
            // spectate target
            var player = this.getSpectateTarget();
            if (player) {
                this.setCenterPos(player.centerPos.x, player.centerPos.y);
                this._scale = player.getScale();
                this.viewBox = player.viewBox;
                this.viewNodes = player.viewNodes;
            }
        }
        // sends camera packet
        this.socket.sendPacket(new Packet.UpdatePosition(
            this, this.centerPos.x, this.centerPos.y, this.getScale()
        ));
    }
    
    if (this.darkServer.config.serverScrambleLevel == 2) {
        // scramble (moving border)
        if (!this.borderCounter) {
            var b = this.darkServer.border, v = this.viewBox;
            var bound = {
                minx: Math.max(b.minx, v.minx - v.halfWidth),
                miny: Math.max(b.miny, v.miny - v.halfHeight),
                maxx: Math.min(b.maxx, v.maxx + v.halfWidth),
                maxy: Math.min(b.maxy, v.maxy + v.halfHeight)
            };
            this.socket.sendPacket(new Packet.SetBorder(this, bound));
        }
        this.borderCounter++;
        if (this.borderCounter >= 20)
            this.borderCounter = 0;
    }
    
    var delNodes = [];
    var eatNodes = [];
    var addNodes = [];
    var updNodes = [];
    var oldIndex = 0;
    var newIndex = 0;
    for (; newIndex < this.viewNodes.length && oldIndex < this.clientNodes.length;) {
        if (this.viewNodes[newIndex].nodeId < this.clientNodes[oldIndex].nodeId) {
            addNodes.push(this.viewNodes[newIndex]);
            newIndex++;
            continue;
        }
        if (this.viewNodes[newIndex].nodeId > this.clientNodes[oldIndex].nodeId) {
            var node = this.clientNodes[oldIndex];
            if (node.isRemoved && node.killedBy !== null && node.owner != node.killedBy.owner)
                eatNodes.push(node);
            else
                delNodes.push(node);
            oldIndex++;
            continue;
        }
        var node = this.viewNodes[newIndex];
        // skip food & eject if not moving
        if (node.isMoving || (node.cellType != 1 && node.cellType != 3))
            updNodes.push(node);
        newIndex++;
        oldIndex++;
    }
    for (; newIndex < this.viewNodes.length; ) {
        addNodes.push(this.viewNodes[newIndex]);
        newIndex++;
    }
    for (; oldIndex < this.clientNodes.length; ) {
        var node = this.clientNodes[oldIndex];
        if (node.isRemoved && node.killedBy !== null && node.owner != node.killedBy.owner)
            eatNodes.push(node);
        else
            delNodes.push(node);
        oldIndex++;
    }
    this.clientNodes = this.viewNodes;
    
    // Send packet
    this.socket.sendPacket(new Packet.UpdateNodes(
        this, addNodes, updNodes, eatNodes, delNodes)
    );
    
    // Update leaderboard
    if (++this.tickLeaderboard > 25) {
        // 1 / 0.040 = 25 (once per second)
        this.tickLeaderboard = 0;
        if (this.darkServer.leaderboardType >= 0) {
            var packet = new Packet.UpdateLeaderboard(this, this.darkServer.leaderboard, this.darkServer.leaderboardType);
            this.socket.sendPacket(packet);
        }
    }
};

PlayerTracker.prototype.updateCenterInGame = function() { // Get center of cells
    if (!this.cells.length) return;
    var cx = 0;
    var cy = 0;
    var count = 0;
    for (var i = 0; i < this.cells.length; i++) {
        var node = this.cells[i];
        cx += node.position.x;
        cy += node.position.y;
        count++;
    }
    if (!count) return;
    this.centerPos.x = cx / count;
	this.centerPos.y = cy / count;
};

PlayerTracker.prototype.updateCenterFreeRoam = function() {
    var dx = this.mouse.x - this.centerPos.x;
    var dy = this.mouse.y - this.centerPos.y;
    var squared = dx * dx + dy * dy;
    if (squared < 1) return; // stop threshold
    // distance
    var d = Math.sqrt(squared);
    var nx = dx / d;
    var ny = dy / d;
    // speed of viewbox
    var speed = Math.min(d, 32);
    if (!speed) return;
    
    var x = this.centerPos.x + nx * speed;
    var y = this.centerPos.y + ny * speed;
    this.setCenterPos(x, y);
};

PlayerTracker.prototype.pressSpace = function() {
    if (this.spectate) {
        // Check for spam first (to prevent too many add/del updates)
        var tick = this.darkServer.tickCounter;
        if (tick - this.lastKeypressTick < 40)
            return;
        this.lastKeypressTick = tick;
        
        // Space doesn't work for freeRoam mode
        if (this.freeRoam || this.darkServer.largestClient === null)
            return;
    } else if (this.darkServer.run) {
        // Disable mergeOverride on the last merging cell
        if (this.cells.length <= 2) {
            this.mergeOverride = false;
        }
        if (this.mergeOverride || this.frozen) 
            return;
        this.darkServer.splitCells(this);
    }
};

PlayerTracker.prototype.pressW = function() {
    if (this.spectate) {
        return;
    }
    else if (this.darkServer.run) {
        this.darkServer.ejectMass(this);
    }
};

PlayerTracker.prototype.pressQ = function() {
    if (this.spectate) {
        // Check for spam first (to prevent too many add/del updates)
        var tick = this.darkServer.tickCounter;
        if (tick - this.lastKeypressTick < 40)
            return;
        this.lastKeypressTick = tick;
        
        if (this.spectateTarget == null) {
            this.freeRoam = !this.freeRoam;
        }
        this.spectateTarget = null;
    }
};

PlayerTracker.prototype.getSpectateTarget = function() {
    if (this.spectateTarget === null || this.spectateTarget.isRemoved || this.spectateTarget.cells.length < 1) {
        this.spectateTarget = null;
        return this.darkServer.largestClient;
    }
    return this.spectateTarget;
};

PlayerTracker.prototype.setCenterPos = function(x, y) {
    x = Math.max(x, this.darkServer.border.minx);
    y = Math.max(y, this.darkServer.border.miny);
    x = Math.min(x, this.darkServer.border.maxx);
    y = Math.min(y, this.darkServer.border.maxy);
    this.centerPos.x = x;
    this.centerPos.y = y;
};
