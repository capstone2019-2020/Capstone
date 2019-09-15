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

// Determining if the coefficient is negative or positive
function fnDetermineNegativeWeight (numberOfVariablesRHS, equation, node, traverse) {

    if (equation.match('-') && numberOfVariablesRHS != 0) {
        // console.log(`Node id: ${node.id}, Equation: ${equation}, number of variables left: ${numberOfVariablesRHS}, traverse number is: ${traverse}`);
        let variable = node.outgoingEdges[traverse].endNode.toString();
        // console.log(`Variable to be split by is: ${variable}`);
        let verify = equation.toString().split(variable);
        // console.log(`Verifying: lhs is: ${verify[0]} and rhs is: ${verify[1]}`);
        
        if (verify[0].search("-") != -1) {
            node.outgoingEdges[traverse].weight = "-"+node.outgoingEdges[traverse].weight; 
            // console.log(`New weight of the Edge ${variable} is: ${node.outgoingEdges[traverse].weight}`);
            if (numberOfVariablesRHS != traverse) {
                value = fnDetermineNegativeWeight(numberOfVariablesRHS-1, verify[1], node, traverse+1);
            }
        } else if (numberOfVariablesRHS != traverse) {        
            value = fnDetermineNegativeWeight(numberOfVariablesRHS-1, verify[1], node, traverse+1);
        } else {
            // console.log("No more equation to evaluate");
            return 0;
        }  
    } else {
        // console.log("The sign - does not exists.")
        return 0;
    }
};

// Create a dynamic array and input each node and return the array when completed
// Creating nodes and edges
function computeSFG (params) {
    let nodes = [];
    let termsoflhs = [];
    let termsofrhs = [];

    // for (let i in nodes) {
    for (let i = 0; i < params.length; i++) {
        //Access the equations and split by lhs and rhs
        let eq = algebra.parse(params[i]);
        termsoflhs.push(eq.lhs.terms);
        termsofrhs.push(eq.rhs.terms);
    }   
    
    // To store into the nodes, go thorugh the termsoflhs list array
    for (let i = 0; i < termsoflhs.length; i++) {
        temp = termsofrhs[i].toString().split(",");
        newNode = new Node (termsoflhs[i].toString());
        
        // Divide the rhs into coefficients and variables and store into the edges
        for (let j = 0; j < temp.length; j++) {
            let tempcoeff = math.rationalize(temp[j], {}, true);
            let endNode = tempcoeff.variables[0];
            let weight = tempcoeff.coefficients[1];
            let verify = endNode.toString().split("x");
            
            // If the coefficient is not just a number then ensure it is verified as a weight
            if (verify[0].match(/^[a-zA-Z]+$/)) {
                endNode = "x"+verify[1];
                if (weight == 1) {
                    weight = verify[0];
                } else {
                    weight = weight+verify[0]
                }
            }
            newNode.outgoingEdges.push(new Edge (weight, termsoflhs[i].toString(), endNode));      
        }
        // Determine if the weight is negative or not using the endnodes and original equation given
        testingNegativeCo = fnDetermineNegativeWeight (temp.length, params[i], newNode, 0);
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
