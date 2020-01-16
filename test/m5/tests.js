exports.equations = [
  {
    e: 'x2 - 3*y - (4*z / 12 - 17) + y - 4.5j + (4*x_3 - 2)/(5-12*some_var) + sin(x_3)',
    vars: {x2: 1, y: 1, z: 1, x_3: 1, some_var: 1},
    eval: 0
  },
  {
    e: 'x3',
    vars: {x3: 1},
    eval: 1
  },
  {
    e: '5 + 7 * 9 - 10/10 +37 * 0.5',
    vars: {},
    eval: 85.5
  }
  // ,
  // 'x3',
  // '5 + 7 * 9 - 10/10 +37 * 0.5',
  // 'x1 + 5 + 7 + x_7',
  // 'x1 + 5 - 7 + x_7 - test + 8.7 - x8',
  // 'x1 * x2 + 7.9 * 10 * 2 - x_3 * 7 + 5.91 - x7 + x8 * 9 * 10.7',
  // 'x1/7 + x2/x3 + 9/7 + 7*x7/x4*8',
  // '(x1 + x2) * (x3 - x4) + 1 / (x1 + x2 * x3) + (x1 + x2) /(x1 + x3)',
  // '(15 - n2) / 12000',
  // 'x + x_7j + 5 + 6j + j + (x2 - 10)/(x * j * j)',
  // '(8-n2)/1000 - (n2 - 0)/2000 + (-2 + n2) / 3000',
  // '(8-n2)/1000 - (n2 - 0)/2000 - (n2 - (-2)) / 3000',
  // '-(n2-n3)/3000',
  // 'Ax0 + Cx1',
  // 'Bx1 + Dx2',
  // '(-n2 + 8 )/1000 - (n2 + 2) /3000'
];

const test = {
  equation: 'x - 3*y - (4*z / 12 - 17) = x * y + 7.9 * 10 * 2 - z',
  rhs: {
    str: 'x - 3*y - (4*z / 12 - 17)',
    terms: [{
      variables: [{
        degree: 1,
        name: ''
      }],
      coeffs: [],
      frac: []
    }],
    toString: '',
    isImag: true,
    real: '',
    imag: ''
  },
  lhs: {
    str: 'x * y + 7.9 * 10 * 2 - z',
    terms: [{
      variables: [{
        degree: 1,
        name: ''
      }],
      coeffs: [],
      frac: []
    }],
    toString: '',
    isImag: true,
    real: '',
    imag: ''
  }
};
