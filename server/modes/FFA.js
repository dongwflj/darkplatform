var Mode = require('./Mode');

function FFA() {
    Mode.apply(this, Array.prototype.slice.call(arguments));

    this.ID = 0;
    this.name = "Free For All";
    this.specByLeaderboard = true;
}

module.exports = FFA;
FFA.prototype = new Mode();

// Gamemode Specific Functions

FFA.prototype.onPlayerSpawn = function(darkServer, player) {
    player.setColor(darkServer.getRandomColor());
    // Spawn player
    darkServer.spawnPlayer(player, darkServer.randomPos());
};

FFA.prototype.updateLB = function(darkServer, lb) {
    darkServer.leaderboardType = this.packetLB;

    for (var i = 0, pos = 0; i < darkServer.clients.length; i++) {
        var player = darkServer.clients[i].playerTracker;
        if (player.isRemoved || !player.cells.length || 
            player.socket.isConnected == false || player.isMi)
            continue;

        for (var j = 0; j < pos; j++)
            if (lb[j]._score < player._score) break;

        lb.splice(j, 0, player);
        pos++;
    }
    this.rankOne = lb[0];
};
