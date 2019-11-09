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
  {
    filepath: 'test/m3/netlist2_dependent.txt',
    data: [
      { id: 'E1', type: 'E', pnode: 1, nnode: 0, ctrlPNode: '1', ctrlNNode: '2', value: 12  },
      { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: 3000  },
      { id: 'C1', type: 'C', pnode: 2, nnode: 0, value: 0.00000001 },
      { id: 'L1', type: 'L', pnode: 2, nnode: 3, value: 0.0000000000063 },
      { id: 'G1', type: 'G', pnode: 3, nnode: 0, ctrlPNode: '2', ctrlNNode: '0',value: 5}
    ]
  },
  /**
   * CASE 3: Complex circuit - contains all supported elements
   */
  {
    filepath: 'test/m3/netlist3_all.txt',
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
      { id: 'C1', type: 'C', pnode: 5, nnode: 0, value: 0.000005 },
      { id: 'E1', type: 'E', pnode: 2, nnode: 3, ctrlPNode: '4', ctrlNNode: '5',value: 13.7},
      { id: 'G1', type: 'G', pnode: 3, nnode: 0, ctrlPNode: '2', ctrlNNode: '3',value: 27.15}
    ]
  },
  /**
   * CASE 4: Invalid case #1 - Unsupported type
   */
  {
    filepath: 'test/m3/netlist4_invalid1.txt',
    data: []
  },
  /**
   * CASE 5: Invalid Case #2 - Too many arguments
   */
  {
    filepath: 'test/m3/netlist5_invalid2.txt',
    data: []
  }
];

/**
 * PART TWO: Circuit Analysis
 */
exports.circuits = [];