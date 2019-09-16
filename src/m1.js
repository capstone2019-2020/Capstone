/**
 * Import the required libraries
 */
const algebra = require('algebra.js');
const math = require('mathjs');
const readline = require('readline');

/**
 * Retrieve user inputs:
 * - n - # of equations
 * - List of equations
 * - Start node
 * - End node
 * Note: Assumes that the user will enter valid values
 */
function getUserInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let n = 0;
  let equations = [];
  let startNode = '';
  let endNode = '';

  // Get the user inputs
  rl.question('Please type in the number of equations: ', (ans) => {
    n = parseInt(ans);
    rl.on('line', (input) => {
      equations.push(algebra.parse(input));

      if (equations.length === n) {
        rl.question('Please type in start node: ', (ans) => {
          startNode = ans;
          rl.question('Please type in end node: ', (end) => {
            endNode = end;
            rl.close();
          });
        });
      }
    });
  });

  /*
   * For testing purposes, print out the variable values
   * Note: Once all of the tasks are completed, will have to add the data processing and function calls here
   */
  rl.on('close', () => {
    console.log('------------------------------------');
    console.log(`RETRIEVED USER INPUTS: `);
    console.log(`n: ${n} `);
    console.log(`equations: `);
    equations.forEach((eq) => console.log(eq.toString()));
    console.log(`start node: ${startNode}`);
    console.log(`end node: ${endNode}`);
    console.log('------------------------------------');
  });
}

// --------------------------------------------------------------------------------------------
// The equation variables must be in the form of lowercase x 
// Objects Node and Edge
function Node (id) {
    this.id = id,
    this.outgoingEdges = []
};

function Edge (weight, startNode, endNode) {
    this.weight = weight,
    this.startNode = startNode,
    this.endNode = endNode,
    this.id = startNode+endNode
};

// Create a dynamic array and input each node
function computeSFG (params) {
    let nodes = [];
    let termsoflhs = [];
    let termsofrhs = [];

    // for (let i in nodes) {
    for (let i = 0; i < params.length; i++) {
        //Access the equations and split by lhs and rhs
        termsoflhs.push(params[i].lhs.terms);
        termsofrhs.push(params[i].rhs.terms);
    }   
    
    // To store into the nodes, go thorugh the termsoflhs list array
    for (let i = 0; i < termsoflhs.length; i++) {
        var tempTerm = termsofrhs[i];
        newNode = new Node (termsoflhs[i].toString());
        
        // Divide the rhs into coefficients and variables and store into the edges
        for (let j = 0; j < tempTerm.length; j++) {
            var weight = tempTerm[j].coefficient();
            var endNode = tempTerm[j].variables;

            // Means there is a alphabet as a coefficient
            if (endNode.length != 1) {
                
              var temp = endNode[endNode.length-1].toString();
              var toBeWeight = endNode.toString().split(temp)
              endNode = endNode[endNode.length-1];

              if (weight == 1) {
                weight = toBeWeight;
              } else if (weight == -1) {
                weight = "-"+toBeWeight;
              } else {
                weight = weight.toString()+toBeWeight[0];
              }
              
              // Get rid of the commas in the weight string
              if (weight.toString().search(',') != -1) {
                weight = weight.toString().replace(/,/g, '');
              }
            }
            newNode.outgoingEdges.push(new Edge (weight, termsoflhs[i].toString(), endNode));      
        }
        nodes.push(newNode);
    }
    return nodes;
};

// Output into the console
function outputSFG (sfgnodes) {
    console.log(`SFG: `);

    for (let i = 0; i < sfgnodes.length; i++) {
        console.log('------------------------------------');
        console.log(`Node: ${sfgnodes[i].id} `);
        console.log('------------------------------------');
        console.log(`Connections: `);
        sfgnodes[i].outgoingEdges.forEach((eq) => console.log(`Edge id ${eq.id}: connected node = ${eq.endNode}, weight = ${eq.weight}`));
    }
};
