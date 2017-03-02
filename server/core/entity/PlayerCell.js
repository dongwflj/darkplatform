var Cell = require('./Cell');

function PlayerCell() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 0;
    this._speed = null;
    this._canRemerge = false;
}

module.exports = PlayerCell;
PlayerCell.prototype = new Cell();

// Main Functions

PlayerCell.prototype.canEat = function (cell) {
    return true; // player cell can eat anyone
};

PlayerCell.prototype.getSpeed = function (dist) {
    var speed = 2.1106 / Math.pow(this._size, 0.449);
    var normalizedDist = Math.min(dist, 32) / 32;
    // tickStep = 40ms
    this._speed = speed * 40 * this.darkServer.config.playerSpeed;
    return this._speed * normalizedDist;
};

PlayerCell.prototype.onAdd = function (darkServer) {
    // Gamemode actions
    darkServer.gameMode.onCellAdd(this);
};

PlayerCell.prototype.onRemove = function (darkServer) {
    // Remove from player cell list
    var index = this.owner.cells.indexOf(this);
    if (index != -1) {
        this.owner.cells.splice(index, 1);
    }
    // Gamemode actions
    darkServer.gameMode.onCellRemove(this);
};
