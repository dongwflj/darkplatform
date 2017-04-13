var Cell = require('./Cell');

function Food() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 1;
}

module.exports = Food;
Food.prototype = new Cell();

// Main Functions

Food.prototype.onAdd = function (darkServer) {
    darkServer.nodesFood.push(this);
};

Food.prototype.onRemove = function (darkServer) {
    // Remove from list of foods
    var index = darkServer.nodesFood.indexOf(this);
    if (index != -1) {
        darkServer.nodesFood.splice(index, 1);
    }
};
