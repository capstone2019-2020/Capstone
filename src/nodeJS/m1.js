/**
 * Import the required libraries
 */
// const algebra = require('algebra.js');
const algebra = require('../RWalgebra/RWalgebra.js');
const math = require('mathjs');
const readline = require('readline');
const m1helper = require('./m1helper.js');
const datamodel = require('./datamodel.js');

function getEquations() {
  /* TODO: implement */
  return {};
}

/**
 *
 *
 * Returns:
 * 1. numer: numerator of transfer function - Expression Object
 * 2. denom: denominator of transfer function - Expression Object
 * 3. bode: Object that contains the bode phase and magnitude equations
 *    a) phase: STRING - equation for actual bode phase plot
 *    b) magnitude: STRING - equation for actual bode magnitude plot
 *
 * @param nodes
 * @param start
 * @param end
 * @returns {{phase, d: *, magnitude, n: *}}
 */
function computeMasons(nodes, start, end) {
  /*
   * Step 1: Calculate numerator and denominator of transfer function separately
   */
  const allLoops = m1helper.findAllLoops(nodes);
  const nonTouchingLoops = m1helper.findNonTouching(allLoops);
  const denom = m1helper.calculateDenominator(allLoops, nonTouchingLoops);
  const numer = m1helper.calculateNumerator(start, end, nodes);

  /*
   * Step 2: Calculate the ACTUAL bode phase and magnitude equations
   *       - Loop Gain = 1 - denom ??
   *
   * Note: the phase and magnitude equations will be returned as a STRING
   * instead of an expression object as the math library does not currently
   * support functions
   */
  let transferFunc = numer.copy().divide(denom.copy());
  const bodePhase = transferFunc.phase();
  const bodeMag = transferFunc.magnitude();

  return {n: numer, // Expression
          d: denom, // Expression
          bode: {
            phase: bodePhase, // String
            magnitude: bodeMag // String
          }
          };
}

function computeLoopGain(nodes) {
  const allLoops = m1helper.findAllLoops(nodes);
  const nonTouchingLoops = m1helper.findNonTouching(allLoops);
  const denom = m1helper.calculateDenominator(allLoops, nonTouchingLoops);

  return denom.subtract(1);
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
 * - n - # of eqns
 * - List of eqns
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
  rl.question('Please type in the number of eqns: ', (ans) => {
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

    var nodes = computeSFG(equations);
    outputSFG(nodes);
    var transferfunc = computeMasons(nodes, startNode, endNode);
    printTransferFunction(transferfunc, startNode, endNode);
  });
}

// Create a dynamic array and input each node
function computeSFG (params) {
  let nodes = [];
  let termsoflhs = [];
  let termsofrhs = [];
  let vNodeNotFound = 0;
  let needToSearchRelation = false;

  for (let i = 0; i < params.length; i++) {
    //Access the eqns and split by lhs and rhs
    if (params[i].lhs.real.terms.length !== 0) {
      termsoflhs.push(params[i].lhs.real.terms);
    }
    if (params[i].lhs.imag.terms.length !== 0) {
      termsoflhs.push(params[i].lhs.imag.terms);
    }
    if (params[i].rhs.imag.terms.length !== 0) {
      termsofrhs.push(params[i].rhs.imag.terms);
    }
    if (params[i].rhs.real.terms.length !== 0) {
      termsofrhs.push(params[i].rhs.real.terms);
    }
    // Right hand side has no terms
    if (params[i].rhs.real.terms.length === 0 && params[i].rhs.imag.terms.length === 0) {
      termsofrhs.push(null);
    }
  }   

  // termsofrhs.forEach(eqns => {console.log(`Terms of rhs ${eqns}`)});
  // To store into the nodes, go thorugh the termsoflhs list array
  for (let i = 0; i < termsoflhs.length; i++) {
    newNode = new datamodel.Node(termsoflhs[i].toString(), null);

    // Find the Node corresponding to the termsoflhs to determine the outoging edges
    // Divide the rhs into coefficients and variables and store into the edges
    for (let j = 0; j < termsofrhs.length; j++) {
      if (termsofrhs[j] !== null) {
        var tempTermOfrhs = termsofrhs[j];
        
        // The variable is found in the rhs of the equation then it must be an outgoing node
        // More than one term in the rhs of the equation
        for (k = 0; k < tempTermOfrhs.length; k++) {
          if (tempTermOfrhs[k].toString().search(termsoflhs[i].toString()) != -1) {
            var weight = tempTermOfrhs[k].coefficient;
            var startNode = tempTermOfrhs[k].variables;

            // Means there is an alphabet as part of the coefficient
            if (startNode.length != 1) {
              check = startNode[startNode.length-1].toString();
              var toBeWeight = startNode.toString().split(termsoflhs[i].toString());

              if (weight > 0) {
                weight = toBeWeight[0];
              } else if (weight < 0) {
                weight = "-"+toBeWeight[0];
              } else {
                weight = weight.toString()+toBeWeight[0];
              }
                
              // Get rid of the commas in the weight string
              if (weight.toString().search(',') != -1) {
                weight = weight.toString().replace(/,/g, '');
              } 
            } else {
              check = startNode.toString();
            }

            // Coefficient includes a fraction  
            if (math.abs(Number(tempTermOfrhs[k].fraction.numer)) !== 1 || math.abs(Number(tempTermOfrhs[k].fraction.denom)) !== 1) {
              if (math.abs(Number(tempTermOfrhs[k].fraction.numer)) == 1 && math.abs(Number(tempTermOfrhs[k].coefficient)) !== 1) {
                weight = weight + "/" + tempTermOfrhs[k].fraction.denom.toString();
              } else {
                weight += "*((" + tempTermOfrhs[k].fraction.numer.toString() + ") / (" + tempTermOfrhs[k].fraction.denom.toString() + "))";
              }
            }

            // Imaginary number case
            if (tempTermOfrhs[k].imag === true) {
              weight = weight + "j";
            }

            if (check === termsoflhs[i].toString()) {
              newNode.outgoingEdges.push(new datamodel.Edge(weight.toString(), termsoflhs[i].toString(), termsoflhs[j].toString()));
            }
          }
        } 
      }   
    }
    nodes.push(newNode);
  }

  // Corner case: the Node only has outgoing edges
  nodesNum = nodes.length;
  for (let i = 0; i < termsofrhs.length; i++) {
    var tempTerm = termsofrhs[i];
    
    if (tempTerm !== null) {
      for (let j = 0; j < tempTerm.length; j++) {
        vNodeNotFound = 0;
  
        for (let numOfNodes = 0; numOfNodes < nodes.length; numOfNodes++) {
          if (tempTerm[j].toString().search(nodes[numOfNodes].id) === -1) {
            vNodeNotFound += 1;
          }
        }
  
        // Create only the missing node
        if (vNodeNotFound === nodes.length) {
          var tempVariable = tempTerm[j].variables;
          var value = null;
          needToSearchRelation = true;
  
          // Means there is an alphabet as part of the coefficient
          if (tempVariable.length != 1) {
            startNode = tempVariable[tempVariable.length-1];
          } 
          else if (tempVariable.length === 1) {
            startNode = tempVariable;
          }
  
          newNode = new datamodel.Node(startNode.toString(), value); 
          nodes.push(newNode);
        }
      }
    }
  }

  // Searching through the rhs of the eqns again to ensure the new nodes are also connected
  if (needToSearchRelation === true) {
    for (let searchNeeded = nodesNum; searchNeeded < nodes.length; searchNeeded++) {
      for (let i = 0; i < termsofrhs.length; i++) {
        var tempTerm = termsofrhs[i];

        if (tempTerm !== null) {
          for (let j = 0; j < tempTerm.length; j++) {
            if (tempTerm[j].toString().search(nodes[searchNeeded].id) != -1) {
              var weight = tempTerm[j].coefficient;
              var tempVariable = tempTerm[j].variables;
  
              if (tempVariable.length != 1) {
                var temp = tempVariable[tempVariable.length-1].toString();
                var toBeWeight = tempVariable.toString().split(temp);
  
                if (weight > 0) {
                  weight = toBeWeight[0];
                } else if (weight < 0) {
                  weight = "-"+toBeWeight[0];
                } else {
                  weight = weight.toString()+toBeWeight[0];
                }
                  
                // Get rid of the commas in the weight string
                if (weight.toString().search(',') != -1) {
                  weight = weight.toString().replace(/,/g, '');
                } 
              } else {
                temp = tempVariable.toString();
              }
  
              // Coefficient includes a fraction  
              if (math.abs(Number(tempTerm[j].fraction.numer)) !== 1 || math.abs(Number(tempTerm[j].fraction.denom)) !== 1) {
                if (math.abs(Number(tempTerm[j].fraction.numer)) == 1 && math.abs(Number(tempTerm[j].coefficient)) !== 1) {
                  weight = weight + "/" + tempTerm[j].fraction.denom.toString();
                } else {
                  weight += "*((" + tempTerm[j].fraction.numer.toString() + ") / (" + tempTerm[j].fraction.denom.toString() + "))";
                }
              }
  
              if (tempTerm[j].imag === true) {
                weight = weight + "j";
              }
              
              if (temp === nodes[searchNeeded].id) {
                nodes[searchNeeded].outgoingEdges.push(new datamodel.Edge (weight.toString(), nodes[searchNeeded].id, termsoflhs[i].toString()));
              }
            }
          }
        }
      }
    }
  }

  // Deal with the constants in the rhs of the equation
  for (let i = 0; i < params.length; i++) {
    // Constant exist in the equation - y1&i as the id for imaginary constants
    if (params[i].rhs.imag.constant !== null) {
      if (params[i].rhs.imag.constant.toString() !== "0") {
        var id = "y1"+i;
        var value = params[i].rhs.imag.constant+"j";
        newNode = new datamodel.Node(id, value); 
        newNode.outgoingEdges.push(new datamodel.Edge("1", id, termsoflhs[i].toString()));
        nodes.push(newNode);
      }
    }

    if (params[i].rhs.real.constant !== null) {
      if (params[i].rhs.real.constant.toString() !== "0") {
        var id = "y2"+i;
        newNode = new datamodel.Node(id, params[i].rhs.real.constant.toString()); 
        newNode.outgoingEdges.push(new datamodel.Edge("1", id, termsoflhs[i].toString()));
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
        console.log(`The value stored in the node is ${sfgnodes[i].value}`)
        console.log('------------------------------------');
        console.log(`Connections: `);
        sfgnodes[i].outgoingEdges.forEach((eq) => console.log(`Edge id ${eq.id}: connected node = ${eq.endNode}, weight = ${eq.weight}`));
    }
};

// getUserInput();

/**
 * Export functions as part of m1 module
 */
module.exports = {
  outputSFG, computeSFG, computeMasons, getEquations, getUserInput, computeLoopGain
};
