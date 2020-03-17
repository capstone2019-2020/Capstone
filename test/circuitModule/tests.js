  /**
   * DPI analysis validation
   *
   * Input: Netlist file name to be passed into n1Consume()
   * Output: Array of equations to be consumed by SFG module
   *
   * Format of test cases:
   * {
   *   fn: input - netlist file name
   *   eqns: output - expected equations
   * }
   */

  const {Expression, Equation} = require('../../src/RWalgebra/RWalgebra.js');
  const assert = require('assert');
  const nl = require('../../src/nodeJS/netlist.js');
  const circuitjs = require('../../src/nodeJS/circuit.js');
  const createCircuit = circuitjs.createCircuit;

  const debug_log = (...params) => {
      console.log(...params);
  }

  /* Some common expressions & values */
  var parallel2Resistors  = new Expression("(1/1000) + (1/2000)").inverse();
  var parallel2Resistors2 = new Expression("(1/1000) + (1/5000)").inverse();
  var parallel2Resistors3 = new Expression("(1/100) + (1/100)").inverse();
  var parallel3Resistors  = new Expression("(1/1000) + (1/2000) + (1/3000)").inverse();
  var parallel3Resistors2 = new Expression("(1/2) + (1/20) + (1/5)").inverse();
  var parallel3Resistors3 = new Expression("(1/5) + (1/10) + (1/2)").inverse();

  var circuits = [
    /* CASE 1: independent voltage sources with resistors*/
    {
        fn: 'test/circuitModule/netlist_ann1.txt',
        eqns: [
            new Equation("V_n1", "8"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel3Resistors),
            new Equation("ISC_n2", "(V_n1/1000) + (V_n3)/3000"),
            new Equation("V_n3", "(-2)")
        ]
    },

    /* CASE 2: independent voltage sources with resistors*/
    {
        fn: "test/circuitModule/netlist_ann2.txt",
        eqns: [
            new Equation("V_n1", "5"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel2Resistors),
            new Equation("ISC_n2", "(V_n1/1000)")
        ]
    },

    /* CASE 3: independent voltage + current sources with resistors*/
    {
        fn: "test/circuitModule/netlist_ann_csrc.txt",
        eqns: [
            new Equation("V_n1", "8"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel3Resistors),
            new Equation("ISC_n2", "(V_n1/1000) + (V_n3)/3000"),
            new Equation("V_n3", "DPI_n3 * ISC_n3"),
            new Equation("DPI_n3", "3000"),
            new Equation("ISC_n3", "(V_n2/3000) + 0.001")
        ]
    },

    /* CASE 4: Independent + dependent voltage source + resistors */
    {
        fn: "test/circuitModule/netlist_ann_vcvs.txt",
        eqns: [
            new Equation("V_n1", "8*V_n2"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel3Resistors),
            new Equation("ISC_n2", "(V_n1/1000) + (V_n3)/3000"),
            new Equation("V_n3", "(-2)")
        ]
    },
  
    /* CASE 5: Independent + dependent voltage source + resistors */
    {
        fn: "test/circuitModule/netlist_ann_vcvs2.txt",
        eqns: [
            new Equation("V_n1", "20"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel3Resistors2),
            new Equation("ISC_n2", "(V_n1/2) + (V_n3)/5"),
            new Equation("V_n3", "DPI_n3 * ISC_n3"),
            new Equation("DPI_n3", parallel3Resistors3),
            new Equation("ISC_n3", "(V_n2/5) + (V_n4)/2"),
            new Equation("V_n4", "8*(V_n2-V_n3)")
        ]
    },
  
    /* CASE 6: Independent + dependent voltage source + resistors (amplifier circuit) */
    {
        fn: "test/circuitModule/netlist_ann_vcvs3.txt",
        eqns: [
            new Equation("V_n1", "0.1"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel2Resistors2),
            new Equation("ISC_n2", "V_n1/1000"),
            new Equation("V_n3", "100 * V_n2"),
            new Equation("V_n4", "DPI_n4 * ISC_n4"),
            new Equation("DPI_n4", parallel2Resistors3),
            new Equation("ISC_n4", "V_n3/100")
        ]
    },

    /* CASE 4: Independent voltage source + dependent current source + resistors */
    {
        fn: "test/circuitModule/netlist_ann_vccs.txt",
        eqns: [
            new Equation("V_n1", "8"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel3Resistors),
            new Equation("ISC_n2", "(V_n1/1000) + (V_n3/3000)"),
            new Equation("V_n3", "DPI_n3 * ISC_n3"),
            new Equation("DPI_n3", "3000"),
            new Equation("ISC_n3", "V_n2/3000"),
            new Equation("ISC_n3", "3*V_n2"),
        ]
    },

    /* CASE 2: Basic circuit + independent current src*/
    {
        fn: "test/circuitModule/netlist_ann_rc.txt",
        eqns: [

        ]
    },

    /* CASE 6: Medium RLC circuit + independent voltage & current src*/
    {
        fn: "test/circuitModule/netlist_rc_simple.txt",
        eqns: [
    
        ]
    }
  ];

  function loadAndSolve(circuits){
    var output = []; // 2D array. outer array holds an array of equations for a netlist
    circuits.forEach(circuit => {
        var intermidiary = nl.nlConsume(circuit.fn);
        var cirObj = createCircuit(intermidiary);
        output.push(cirObj.dpiAnalysis());
    });
    return output;
  }

/**
 * Used to verify the equations produced by circuit.js -> dpiAnalysis() function
 *
 * NOTE: Assumes that
 *
 * @param output {array of equations computed by the functions}
 * @param expected {hand-computed equations listed in ./tests.js}
 * @returns true if actual output matches expected
 */
function verifyCircuit(output, expected) {

    /**
     * Step 1: Convert equations into strings
     */
    let actual_eqns = output;
    let expected_eqns = [];
  
    expected.forEach((node_eqns) => {
        expected_eqns.push(node_eqns.eqns);
    });

    /* Step 2: Loop through all the equations, verify that they match */
    let i, j;
    let anode, enode, node_eqn1, node_eqn2; // list of node equations
    for (i = 0; i < expected_eqns.length; i++) {
      // deal with an array of equations for 1 circuit
      anode = actual_eqns[i];
      enode = expected_eqns[i];
  
      /* Verify number of equations */
      if (enode.length !== anode.length) {
        debug_log(`ERROR: Example ${i} expected ${enode.length} equations, received ${anode.length}`);
            for (j = 0; j < enode.length; j++) {
                debug_log(`Expected: ${enode[j].toString()}`);
            }
            for (k = 0; k <anode.length; k++){
                debug_log(`Actual: ${anode[k].toString()}`);
            }
        return false;
      }
  
      let result1 = {}
      let result2 = {}
      /* Verify equations match the expected */
      for (j = 0; j < enode.length; j++) {
        expected_eq = enode[j].toString();
        actual_eq = anode.includes(expected_eq); //enode[j].toString();
 
        if (actual_eq == undefined){
          debug_log(`ERROR: Expected equation ${node_eqn1} could not be found`);
          return false;
        }
      }
      return true;
    }
  };

(function main(){
    var actualEqns = loadAndSolve(circuits);
    if (verifyCircuit(actualEqns, circuits)){
        debug_log(`TEST ALL PASSED`);
    }
    else {
        debug_log(`TEST FAILED`);
    }
})();