var Cell = require('./Cell');

function EjectedMass() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 3;
}

module.exports = EjectedMass;
EjectedMass.prototype = new Cell();

// Main Functions

EjectedMass.prototype.onAdd = function (darkServer) {
    // Add to list of ejected mass
    darkServer.nodesEjected.push(this);
};

EjectedMass.prototype.onRemove = function (darkServer) {
    // Remove from list of ejected mass
    var index = darkServer.nodesEjected.indexOf(this);
    if (index != -1) {
        darkServer.nodesEjected.splice(index, 1);
    }
};
