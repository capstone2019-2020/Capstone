// --------------------------------------------------------------------------------------------
// The equation variables must be in the form of lowercase x 
// Objects Node and Edge
function Node (id, value) {
    this.id = id,
    this.value = value,
    this.outgoingEdges = []
};

function Edge (weight, startNode, endNode) {
    this.weight = weight,
    this.startNode = startNode,
    this.endNode = endNode,
    this.id = startNode+endNode
};

/**
 * Export classes as part of m1 module
 */
module.exports = {
    Node, Edge
  };
