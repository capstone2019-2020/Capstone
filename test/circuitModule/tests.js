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

  var showAllEqns = true;
  var accuracyThreshold = Math.pow(1, -12);
  /* Some common expressions & values */
  var parallel2Resistors  = new Expression("(1/1000) + (1/2000)").inverse();
  var parallel2Resistors2 = new Expression("(1/1000) + (1/5000)").inverse();
  var parallel2Resistors3 = new Expression("(1/100) + (1/100)").inverse();
  var parallel3Resistors  = new Expression("(1/1000) + (1/2000) + (1/3000)").inverse();
  var parallel3Resistors2 = new Expression("(1/2) + (1/20) + (1/5)").inverse();
  var parallel3Resistors3 = new Expression("(1/5) + (1/10) + (1/2)").inverse();
  var parallelResistorAndCapacitor = new Expression("(1/4) + 0.002*j*w").inverse();
  var opampRC1 = new Expression("(1/1000) + 0.0000008 * j*w").inverse();
  var opampRC2 = new Expression("(1/1000) + 0.0000000004 * j*w").inverse();
  var opampFeedback = new Expression("(1/1000) + (1/4000)").inverse();

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
    },

    /* CASE 9: */
    {
        fn: "test/circuitModule/netlist_ann_opampFeedback.txt",
        eqns: [
            new Equation("V_n7", "1"),
            new Equation("V_n3", "10000 * (V_n7 - V_n1)"),
            new Equation("V_n4", "DPI_n4 * ISC_n4"),
            new Equation("DPI_n4", opampRC1),
            new Equation("ISC_n4", "V_n3/1000"),
            new Equation("V_n5", "V_n4"),
            new Equation("V_n6", "DPI_n6 * ISC_n6"),
            new Equation("DPI_n6", opampRC2),
            new Equation("ISC_n6", "V_n5/1000"),
            new Equation("V_n2", "V_n6"),
            new Equation("V_n1", "DPI_n1 * ISC_n1"),
            new Equation("DPI_n1", opampFeedback),
            new Equation("ISC_n1", "V_n2/4000")
        ]
    }
  ];

  function loadAndSolve(circuits){
    var output = []; 
    circuits.forEach(circuit => {
        var intermidiary = nl.nlConsume(circuit.fn);
        var cirObj = createCircuit(intermidiary);
        var results = cirObj.dpiAnalysis();
        var stringyfied_result = {};// dictionary. key = equation in string format | value = equation in Expression obj
        results.forEach(eq => {
            stringyfied_result[eq.toString()] = eq;
        });
        output.push(stringyfied_result);
    });
    return output;
  }

function eqnsNumCheck(expected_eqns, actual_eqns) {
    /* Verify number of equations in a test case */
    if (expected_eqns.length !== actual_eqns.length) {
        debug_log(`[ERROR] expected ${expected_eqns.length} equations, received ${actual_eqns.length}`);
            for (j = 0; j < expected_eqns.length; j++) {
                debug_log(`Expected: ${expected_eqns[j].toString()}`);
            }
            for (k = 0; k <actual_eqns.length; k++){
                debug_log(`Actual: ${actual_eqns[k].toString()}`);
            }
        debug_log("Test case failed");
    }
    else{
        debug_log(`[INFO] received ${actual_eqns.length} equations as expected`);
    }
}
function eqnEvaluationCheck(expected_eqn, actual_eqns){
    // check if the simplication bug only happens with imaginary numbers
    assert(expected_eqn.rhs.isComplex());

    var expectedLhs = expected_eqn.lhs;
    
    for (var eqnString in actual_eqns){
        var actualLhs = actual_eqns[eqnString].lhs; //a_eqn.val.lhs;
        if (expectedLhs.toString() == actualLhs.toString()){
            var randNum = Math.random() * 1000000; // just generating randome number that is big enough
            var expectedEval = expected_eqn.rhs.eval({'w': randNum});
            var actualEval = actual_eqns[eqnString].rhs.eval({'w': randNum});

            // Sometimes, floating point error makes the test fail. 
            // floataing point error causes the diff to be very small number (order of e-14 ish)
            // so in this case, treat the comparison result = true
            var diff = expectedEval.subtract(actualEval)
            diff = Math.abs(diff.imag.constant);

            if (diff < accuracyThreshold){
                return true;
            }
            else{
                return false;
            }
        }
    }
    return false;
}

function individualEqnsCheck(expected_eqns, actual_eqns) {
    var correct_eqns = 0;
    var successful = true;

    // for debugging
    if (showAllEqns){
        console.log(Object.keys(actual_eqns));
    }

    /* Verify equations match the expected */
    for (j = 0; j < expected_eqns.length; j++) {
        expected_eq = expected_eqns[j].toString();
        actual_eq = actual_eqns[expected_eq]; //serach dictionary by key
        if (actual_eq == undefined){// could be false negative due to simplify bug, so check further
            if (eqnEvaluationCheck(expected_eqns[j], actual_eqns)){
                correct_eqns ++;
            }
            else{
                debug_log(`[ERROR] Expected equation ${expected_eq} could not be found in actual output`);
                successful = false;
            }
        }
        else{
            correct_eqns ++;
        }
    }
    debug_log(`[INFO] ${correct_eqns} out of ${expected_eqns.length} equations matched\n`);
    return successful;
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
    var correct_tcs = 0;

    // Loop through each test case
    expected.forEach((node_eqns, tc_num) => {
        var anode = output[tc_num]; // this returns a dictionary of equations
        var file_name = node_eqns.fn;
        var tc_eqns = node_eqns.eqns; // an array of equations for 1 test case

        debug_log(`Test #${tc_num}: ${file_name}`);

        eqnsNumCheck(tc_eqns, Object.keys(anode));
        if (individualEqnsCheck(tc_eqns, anode)){
            correct_tcs ++;
        }
    });

    debug_log("---------- [RESULT] ----------");
    debug_log(`PASS: ${correct_tcs} test cases`);
    debug_log(`FAIL: ${expected.length - correct_tcs} test cases`);
    
  };

(function main(){
    var actualEqns = loadAndSolve(circuits);
    verifyCircuit(actualEqns, circuits);
})();