/**
 * Import the required libraries
 */
const algebra = require('algebra.js');
const math = require('mathjs');
const readline = require('readline');
const m1helper = require('./m1helper.js');


function getEquations() {
  /* TODO: implement */
  return {};
}

function computeMasons(nodes, start, end) {
  /* TODO: implement */

  /* Calculate denominator
  * 1. Get all loops in the SFG -- DONE
  * 2. Get all of the nth non-touching loops -- DONE
  * 3. Generate denominator
  *   denom = 1 - all loop gains + all 2 non-touching loops - all 3 non-touching loops ...
  * */
  const allLoops = m1helper.findAllLoops(nodes);
  const nonTouchingLoops = m1helper.findNonTouching(allLoops);
  const denom = m1helper.calculateDenominator(allLoops, nonTouchingLoops);
  return {
    n: 'numerator_goes_here',
    d: denom
  };
}

/**
 * Print out the transfer function - need to format this ourselves since currently algebra.js only supports dividing by constant integers/fractions
 *
 * @param func -- transfer function object of the form {n: numerator, d: denominator} - each field is an algebra.Expression object
 * @param start -- start node (a string)
 * @param end -- end node (a string)
 */
function printTransferFunction(func, start, end) {
  console.log(`${end}/${start} = (${func.n.toString()}) / (${func.d.toString()})`);
}

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
  let vNodeNotFound = 0;

  // for (let i in nodes) {
  for (let i = 0; i < params.length; i++) {
      //Access the equations and split by lhs and rhs
      termsoflhs.push(params[i].lhs.terms);
      termsofrhs.push(params[i].rhs.terms);
  }   
  
  // To store into the nodes, go thorugh the termsoflhs list array
  for (let i = 0; i < termsoflhs.length; i++) {
      newNode = new Node (termsoflhs[i].toString());

      // Find the Node corresponding to the termsoflhs to determine the outoging edges
      // Divide the rhs into coefficients and variables and store into the edges
        for (let j = 0; j < termsofrhs.length; j++) {
          var tempTermOfrhs = termsofrhs[j];

          // The variable is found in the rhs of the equation then it must be an outgoing node
          // More than one term in the rhs of the equation
          for (k = 0; k < tempTermOfrhs.length; k++) {
            if (tempTermOfrhs[k].toString().search(termsoflhs[i].toString()) != -1) {
              var weight = tempTermOfrhs[k].coefficient();
              var startNode = tempTermOfrhs[k].variables;

              // Means there is an alphabet as part of the coefficient
              if (startNode.length != 1) {
                var toBeWeight = startNode.toString().split(termsoflhs[i].toString());

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
              newNode.outgoingEdges.push(new Edge (weight, termsoflhs[i].toString(), termsoflhs[j].toString()));
            }
          }      
        }
      nodes.push(newNode);
  }

  // Corner case: the Node only has outgoing edges
  for (let i = 0; i < termsofrhs.length; i++) {
    var tempTerm = termsofrhs[i];
    
    for (let j = 0; j < tempTerm.length; j++) {
      vNodeNotFound = 0;

      for (let numOfNodes = 0; numOfNodes < nodes.length; numOfNodes++) {
        if (tempTerm[j].toString().search(nodes[numOfNodes].id) === -1) {
          vNodeNotFound += 1;
        }
      }

      if (vNodeNotFound === nodes.length) {
        var weight = tempTerm[j].coefficient();
        var tempVariable = tempTerm[j].variables;

        // Means there is an alphabet as part of the coefficient
        if (tempVariable.length != 1) {
          var temp = tempVariable[tempVariable.length-1].toString();
          var toBeWeight = tempVariable.toString().split(temp)
          startNode = tempVariable[tempVariable.length-1];

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
        } else if (tempVariable.length === 1) {
          startNode = tempVariable;
        }

        newNode = new Node(startNode.toString());
        newNode.outgoingEdges.push(new Edge (weight, startNode.toString(), termsoflhs[i].toString()));
        nodes.push(newNode);
      }
    }
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

/**
 * Export functions as part of m1 module
 */
module.exports = {
  Node, Edge, outputSFG, computeSFG, computeMasons, getEquations, getUserInput
};
