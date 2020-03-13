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

  /* Some common expressions & values */
  var parallel2Resistors  = new Expression("(1/1000) + (1/2000)").inverse();
  var parallel2Resistors2 = new Expression("(1/1000) + (1/5000)").inverse();
  var parallel2Resistors3 = new Expression("(1/100) + (1/100)").inverse();
  var parallel3Resistors  = new Expression("(1/1000) + (1/2000) + (1/3000)").inverse();
  var parallel3Resistors2 = new Expression("(1/2) + (1/20) + (1/5)").inverse();
  var parallel3Resistors3 = new Expression("(1/5) + (1/10) + (1/2)").inverse();

  exports.circuits = [
    /* CASE 1: independent voltage sources with resistors*/
    {
        fn: "netlist_ann1.txt",
        eqns: [
            new Equation("V_n1", "8"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel3Resistors),
            new Equation("ISC_n2", "(V_n1/1000) + (V_n3)/3000")
        ]
    },

    /* CASE 2: independent voltage sources with resistors*/
    {
        fn: "netlist_ann2.txt",
        eqns: [
            new Equation("V_n1", "5"),
            new Equation("V_n2", "DPI_n2 * ISC_n2"),
            new Equation("DPI_n2", parallel2Resistors),
            new Equation("ISC_n2", "(V_n1/1000)")
        ]
    },

    /* CASE 3: independent voltage + current sources with resistors*/
    {
        fn: "netlist_ann_csrc.txt",
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
        fn: "netlist_ann_vcvs.txt",
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
        fn: "netlist_ann_vcvs2.txt",
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
        fn: "netlist_ann_vcvs3.txt",
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
        fn: "netlist_ann_vccs.txt",
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
        fn: "netlist_ann_rc.txt",
        eqns: [

        ]
    },

    /* CASE 6: Medium RLC circuit + independent voltage & current src*/
    {
        fn: "netlist_rc_simple.txt",
        eqns: [
    
        ]
    }
  ];