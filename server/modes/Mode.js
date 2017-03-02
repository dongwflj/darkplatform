function Mode() {
    this.ID = -1;
    this.name = "Blank";
    this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
    this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams
    this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
}

module.exports = Mode;

// Override these

Mode.prototype.onServerInit = function (darkServer) {
    // Called when the server starts
    darkServer.run = true;
};

Mode.prototype.onTick = function (darkServer) {
    // Called on every game tick 
};

Mode.prototype.onPlayerInit = function (player) {
    // Called after a player object is constructed
};

Mode.prototype.onPlayerSpawn = function (darkServer, player) {
    // Called when a player is spawned
    player.setColor(darkServer.getRandomColor()); // Random color
    darkServer.spawnPlayer(player, darkServer.randomPos());
};

Mode.prototype.onCellAdd = function (cell) {
    // Called when a player cell is added
};

Mode.prototype.onCellRemove = function (cell) {
    // Called when a player cell is removed
};

Mode.prototype.onCellMove = function (cell, darkServer) {
    // Called when a player cell is moved
};

Mode.prototype.updateLB = function (darkServer) {
    // Called when the leaderboard update function is called
    darkServer.leaderboardType = this.packetLB;
};
