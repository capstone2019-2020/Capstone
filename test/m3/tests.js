/**
 * PART ONE: SPICE List parsing
 * Input: filepath to netlist.txt file
 * Output: data structures in the form
 * {
 *     id: arg1
 *     type: 'R | L | C | I | ID | VD',
 *     pnode: arg2,
 *     nnode: arg3,
 *     value: arg4
 *   }
 */
exports.netlists = [
  /**
   * CASE 0: Super basic case - No sources
   */
  {
    filepath: 'test/m3/netlist0.txt',
    data: [
      { id: 'R1sc', type: 'R', pnode: 0, nnode: 1, value: 100000 },
      { id: 'R2sc', type: 'R', pnode: 1, nnode: 3, value: 100000 },
      { id: 'Cnsn', type: 'C', pnode: 1, nnode: 0, value: 0.000000000005 },
      { id: 'RLsc', type: 'R', pnode: 3, nnode: 0, value: 2000 },
      { id: 'CLsc', type: 'C', pnode: 3, nnode: 0, value: 0.0000000001 }
    ]
  },
  /**
   * CASE 1: Basic Circuit Elements (R, L, C) + Independent Sources
   */
  {
    filepath: 'test/m3/netlist1_independent.txt',
    data: [
      { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: 12 },
      { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: 3000 },
      { id: 'C1', type: 'C', pnode: 2, nnode: 0, value: 0.00000001 },
      { id: 'L1', type: 'L', pnode: 2, nnode: 3, value: 1 },
      { id: 'I1', type: 'I', pnode: 3, nnode: 0, value: 0.008 }
    ]
  },
  /**
   * CASE 2: Basic Circuit Elements (R, L, C) + Dependent Sources
   * NOTE: DEPENDENT SOURCES NOT YET SUPPORTED
   */
  // {
  //   filepath: 'test/m3/netlist2_all.txt',
  //   data: [
  //     { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: 12  },
  //     { id: 'V2', type: 'V', pnode: 3, nnode: 0, value: 13  },
  //     { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: 4000 },
  //     { id: 'R2', type: 'R', pnode: 2, nnode: 4, value: 50.5 },
  //     { id: 'R3', type: 'R', pnode: 3, nnode: 4, value: 0.006 },
  //     { id: 'R4', type: 'R', pnode: 3, nnode: 5, value: 12 },
  //     { id: 'L1', type: 'L', pnode: 2, nnode: 3, value: 2 },
  //     { id: 'L2', type: 'L', pnode: 1, nnode: 0, value: 12 },
  //     { id: 'L3', type: 'L', pnode: 4, nnode: 5, value: 5.6 },
  //     { id: 'C1', type: 'C', pnode: 5, nnode: 0, value: 0.000005 }
  //   ]
  // },
  /**
   * CASE 3: Complex circuit - contains all supported elements
   */
  {
    filepath: 'test/m3/netlist2_all.txt',
    data: [
      { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: 12  },
      { id: 'V2', type: 'V', pnode: 3, nnode: 0, value: 13  },
      { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: 4000 },
      { id: 'R2', type: 'R', pnode: 2, nnode: 4, value: 50.5 },
      { id: 'R3', type: 'R', pnode: 3, nnode: 4, value: 0.006 },
      { id: 'R4', type: 'R', pnode: 3, nnode: 5, value: 12 },
      { id: 'L1', type: 'L', pnode: 2, nnode: 3, value: 2 },
      { id: 'L2', type: 'L', pnode: 4, nnode: 0, value: 3 },
      { id: 'L3', type: 'L', pnode: 4, nnode: 5, value: 5.6 },
      { id: 'C1', type: 'C', pnode: 5, nnode: 0, value: 0.000005 }
    ]
  },
  /**
   * CASE 4: Invalid case #1 - Unsupported type
   */
  {
    filepath: 'test/m3/netlist3_invalid1.txt',
    data: []
  },
  /**
   * CASE 5: Invalid Case #2 - Too many arguments
   */
  {
    filepath: 'test/m3/netlist4_invalid2.txt',
    data: []
  }
];

/**
 * PART TWO: Circuit Analysis
 */
exports.circuits = [];