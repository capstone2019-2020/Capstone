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
  var parallelResistorAndCapacitor = new Expression("(1/4) + 0.002*j*w").inverse();

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
            new Equation("ISC_n3", "(V_n2/3000)"),
            new Equation("ISC_n3", "0.001")
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

    /* CASE 7: Independent voltage source + dependent current source + resistors */
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
            new Equation("ISC_n3", "3*V_n2")
        ]
    },

    /* CASE 8: */
    {
        fn: "test/circuitModule/netlist_ann_rc.txt",
        eqns: [
            new Equation("V_n1", "24"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallelResistorAndCapacitor),
            new Equation("ISC_n2", "(V_n1/4)")
        ]
    },

    /* CASE 9: */
    {
        fn: "test/circuitModule/netlist_rc_simple.txt",
        eqns: [
            new Equation("V_n1", "24"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallelResistorAndCapacitor),
            new Equation("ISC_n2", "(V_n1/4)")
        ]
    }
  ];

  function loadAndSolve(circuits){
    var output = []; // 2D array. outer array holds an array of equations for a netlist
    circuits.forEach(circuit => {
        var intermidiary = nl.nlConsume(circuit.fn);
        var cirObj = createCircuit(intermidiary);
        var results = cirObj.dpiAnalysis();
        var stringyfied_result = [];
        results.forEach(eq => {
            stringyfied_result.push(eq.toString());
        });
        output.push(stringyfied_result);
    });
    return output;
  }

/**
 * Used to verify the equations produced by circuit.js -> dpiAnalysis() function
 *
 * NOTE: Assumes that
 *
 * @param output {2D array of equations computed by the functions}
 * @param expected {hand-computed equations listed in ./tests.js}
 * @returns true if actual output matches expected
 */
function verifyCircuit(output, expected) {
    // Loop through each test case
    expected.forEach((node_eqns, tc_num) => {
        var anode = output[tc_num];
        var file_name = node_eqns.fn;
        var tc_eqns = node_eqns.eqns; // an array of equations for 1 test case

        debug_log(`Test #${tc_num}: ${file_name}`);

        /* Verify number of equations in a test case */
        if (tc_eqns.length !== anode.length) {
            debug_log(`ERROR: expected ${tc_eqns.length} equations, received ${anode.length}`);
                for (j = 0; j < tc_eqns.length; j++) {
                    debug_log(`Expected: ${tc_eqns[j].toString()}`);
                }
                for (k = 0; k <anode.length; k++){
                    debug_log(`Actual: ${anode[k].toString()}`);
                }
            debug_log("Test case failed");
        }

        /* Verify equations match the expected */
        for (j = 0; j < tc_eqns.length; j++) {
            expected_eq = tc_eqns[j].toString();
            actual_eq = anode.includes(expected_eq); //enode[j].toString();
    
            if (actual_eq == undefined || actual_eq == false){
                debug_log(`ERROR: Expected equation ${expected_eq} could not be found in actual output`);
            }
        }
    });
  };

(function main(){
    var actualEqns = loadAndSolve(circuits);
    verifyCircuit(actualEqns, circuits);
})();