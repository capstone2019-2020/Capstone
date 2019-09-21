const algebra = require('algebra.js');
const Expression = algebra.Expression;

const DEBUG = 0;

/**
 * Wrapper function that performs DFS to find all the loops in the graph.
 * High level overview:
 * 1. Loop through all of the nodes
 * 2. For each node, do DFS to find all simple cycles that start and end with that node
 *
 * @param nodes
 * @returns List all of the cycles (list of a list - each element contains a list of edges indicating a cycle)
 */
function findAllLoops(nodes) {
  let visited = [];
  let stack = [];
  let cycles = [];

  nodes.forEach((node) => {
    dfsFindLoops(nodes, node, node.id, visited, stack, cycles);
  });

  // For debugging purposes - print out the found loops if DEBUG enabled
  if (DEBUG) {
    console.log(`----------------------------------`);
    console.log(`Found ${cycles.length} loops:`);
    console.log(`----------------------------------`);
    cycles.forEach((e) => printEdges(e));
  }

  return cycles;
}

/**
 * Performs DFS to find all the simple cycles that start and end with the startId
 *
 * @param nodes
 * @param curr - current node that we are traversing
 * @param startId - root node used to determine a cycle
 * @param visited - List of the nodes that have already been visited
 * @param stack - Contains a list of edges that the algorithm has currently traversed
 * @param cycles
 */
function dfsFindLoops(nodes, curr, startId, visited, stack, cycles) {
  visited.push(curr.id);
  let v, edge, i;
  let edges = curr.outgoingEdges;

  for (i = 0; i < edges.length; i++) {
    edge = edges[i];
    v = nodes.find(x => x.id === edge.endNode);

    // Found a cycle
    if (v.id === startId) {
      stack.push(edge);
      let copy = [...stack];
      cycles.push(copy);
      stack.pop();
      continue;
    }

    // No cycle found, need to keep traversing graph
    if (!visited.includes(v.id)){
      stack.push(edge);
      dfsFindLoops(nodes, v, startId, visited, stack, cycles);
    }
  }

  if (curr.id !== startId) {
    stack.pop();
    visited.pop();
  }
}

/**
 * Helper function for debugging.
 * Prints out the path indicated by the edges parameter
 *
 * @param edges
 */
function printEdges(edges) {
  let str = '';
  edges.forEach((e, i) => {
    if (i === 0)
      str += `${e.startNode}`;
    str +=` -> ${e.endNode}`;
  })
  console.log(str);
}

function findNonTouchingLoops(loops) {

}

/**
 * Returns the denominator for the transfer function using Mason's Rule formula
 *   Denominator = 1 - all loop gains + all 2 non-touching - all 3 non-touching ...
 *
 * @param allLoops - All simple cycles in a graph
 * @param nonTouching - List of nth order non-touching loops
 */
function getDenominator(allLoops, nonTouching) {

}

/**
 * Calculate the loop gain using the edge weights
 *
 * @param edges
 * @returns {Expression|*}
 */
function calculateLoopGain(edges) {
  let ex = new Expression(1);
  edges.forEach((e) => {
    ex = ex.multiply(e.weight);
  });

  if (DEBUG) {
    console.log(`Loop Gain: ${ex.toString()}`);
  }
  return ex;
}

/*
 * Export helper functions
 */
module.exports = {
  findAllLoops
};