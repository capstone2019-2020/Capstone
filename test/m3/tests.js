/**
 * PART ONE: SPICE List parsing
 * Input: filepath to netlist.txt file
 * Output: data structures in the form
 * {
 *     id: arg1
 *     type: 'R | L | C | I | E | G',
 *     pnode: arg2,
 *     nnode: arg3,
 *     ctrlPNode: for types E & G only,
 *     ctrlNNode: for types E & G only,
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
      { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: '12' },
      { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: '3k' },
      { id: 'C1', type: 'C', pnode: 2, nnode: 0, value: '10n'},
      { id: 'L1', type: 'L', pnode: 2, nnode: 3, value: '1' },
      { id: 'I1', type: 'I', pnode: 3, nnode: 0, value: '8m' }
    ]
  },
  /**
   * CASE 2: Basic Circuit Elements (R, L, C) + Dependent Sources
   * NOTE: DEPENDENT SOURCES NOT YET SUPPORTED
   */
  {
    filepath: 'test/m3/netlist2_dependent.txt',
    data: [
      { id: 'E1', type: 'E', pnode: 1, nnode: 0, ctrlPNode: '1', ctrlNNode: '2', value: '12'  },
      { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: '3k' },
      { id: 'C1', type: 'C', pnode: 2, nnode: 0, value: '10n' },
      { id: 'L1', type: 'L', pnode: 2, nnode: 3, value: '6.3p' },
      { id: 'G1', type: 'G', pnode: 3, nnode: 0, ctrlPNode: '2', ctrlNNode: '0',value: '5'}
    ]
  },
  /**
   * CASE 3: Complex circuit - contains all supported elements
   */
  {
    filepath: 'test/m3/netlist3_all.txt',
    data: [
      { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: '12'  },
      { id: 'V2', type: 'V', pnode: 3, nnode: 0, value: '13'  },
      { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: '4k' },
      { id: 'R2', type: 'R', pnode: 2, nnode: 4, value: '50.5' },
      { id: 'R3', type: 'R', pnode: 3, nnode: 4, value: '6m' },
      { id: 'R4', type: 'R', pnode: 3, nnode: 5, value: '12' },
      { id: 'L1', type: 'L', pnode: 2, nnode: 3, value: '2' },
      { id: 'L2', type: 'L', pnode: 4, nnode: 0, value: '3' },
      { id: 'L3', type: 'L', pnode: 4, nnode: 5, value: '5.6' },
      { id: 'C1', type: 'C', pnode: 5, nnode: 0, value: '5u' },
      { id: 'E1', type: 'E', pnode: 2, nnode: 3, ctrlPNode: '4', ctrlNNode: '5',value: '13.7'},
      { id: 'G1', type: 'G', pnode: 3, nnode: 0, ctrlPNode: '2', ctrlNNode: '3',value: '27.15'}
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
 *
 * Input: Circuit data structure that would be outputted by netlist.nlConsume() function
 * Output: Array of equations
 *
 * Format of test cases:
 * {
 *   c: input - array of netlist data structures
 *   eqns: output - expected equations
 * }
 */
exports.circuits = [
  /* CASE 1: Basic circuit + independent voltage src*/
  {
    c: [
      { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: '12'  },
      { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: '9000'  },
      { id: 'R2', type: 'R', pnode: 2, nnode: 0, value: '6000'  },
      { id: 'R3', type: 'R', pnode: 2, nnode: 3, value: '3000'  },
      { id: 'R4', type: 'R', pnode: 3, nnode: 0, value: '4000'  }
    ],
    eqns: [
      'I0 = (12 - n2)/9000',
      'I1 = (n2)/6000',
      'I2 = (n2 - n3)/3000',
      'I0 - I1 - I2 = 0'
    ]
  },
  /* CASE 2: Basic circuit + independent current src*/
  {
    c: [
      { id: 'I1', type: 'I', pnode: 1, nnode: 0, value: '0.003'  },
      { id: 'R1', type: 'R', pnode: 1, nnode: 0, value: '4000'  },
      { id: 'R2', type: 'R', pnode: 1, nnode: 2, value: '5600'  },
      { id: 'I2', type: 'I', pnode: 0, nnode: 2, value: '0.002'  }
    ],
    eqns: [
      'I1 = (n1)/4000',
      '0.002 = (n1 - n2)/5600',
      '-0.003 + I1 + 0.002 = 0'
    ]
  },
  // /* TODO CASE 3: Basic circuit + DEPENDENT voltage src*/
  // {
  //   c: [
  //
  //   ],
  //   eqns: [
  //
  //   ]
  // },
  // /* TODO CASE 4: Basic RLC circuit + DEPENDENT current src*/
  // {
  //   c: [
  //
  //   ],
  //   eqns: [
  //
  //   ]
  // },
  /* CASE 5: Basic R circuit + independent voltage & current src*/
  {
    c: [
      { id: 'I1', type: 'I', pnode: 1, nnode: 0, value: '0.003'  },
      { id: 'R1', type: 'R', pnode: 1, nnode: 0, value: '4000'  },
      { id: 'R2', type: 'R', pnode: 1, nnode: 2, value: '5600'  },
      { id: 'V1', type: 'V', pnode: 2, nnode: 0, value: '12'  }
    ],
    eqns: [
      'I1 = (n1)/4000',
      'I2 = (n1 - 12)/5600',
      '-0.003 + I1 + I2 = 0'
    ]
  },
  /* CASE 6: Medium RLC circuit + independent voltage & current src*/
  {
    c: [
      { id: 'V1', type: 'V', pnode: 1, nnode: 3, value: '15'  },
      { id: 'R1', type: 'R', pnode: 2, nnode: 1, value: '12000'  },
      { id: 'R2', type: 'R', pnode: 3, nnode: 2, value: '2000'  },
      { id: 'R3', type: 'R', pnode: 2, nnode: 0, value: '8000'  },
      { id: 'R4', type: 'R', pnode: 3, nnode: 0, value: '1000'  },
      { id: 'R5', type: 'R', pnode: 4, nnode: 3, value: '7000'  },
      { id: 'R6', type: 'R', pnode: 1, nnode: 4, value: '6000'  },
      { id: 'I1', type: 'I', pnode: 4, nnode: 0, value: '0.0045'  }
    ],
    eqns: [
      'I0 = (n3 - n2)/2000',
      'I1 = (n2 - n1)/12000',
      'I2 = (n1 - n4)/6000',
      'I3 = (n3)/1000',
      'I4 = (n2)/8000',
      'I6 = (n4 - n3)/7000',
      '-I3 - I4 + 0.0045 = 0',
      '- I0 + I1 + I4 = 0',
      '- I2 - 0.0045 + I6 = 0'
    ]
  },
  /* TODO CASE 7: Hard circuit + independent voltage & current src*/
  {
    c: [

    ],
    eqns: [

    ]
  },
];