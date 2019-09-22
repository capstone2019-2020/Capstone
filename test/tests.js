exports.equations = [
  { // 0
    equations: [
      'x2 = l * x1 + e * x3',
      'x3 = a * x2 + f * x4',
      'x4 = b * x3 + g * x5',
      'x5 = c * x4 + d * x2',
      'x6 = l * x5'
    ],
    start: 'x2',
    end: 'x6',
    n: 'a * b * c + d * (1 - b * f)',
    d: 'l - a * e - h * f - c * g - d * g * f * e + a * e * c * g'
  },
  { // 1
    equations: [
      'x2 = x1 + L * x2',
      'x3 = x2'
    ],
    start: 'x1',
    end: 'x3',
    n: '1',
    d: '1 - L'
  },
  { // 2
    equations: [
      'x2 = a * x1 + e * x4',
      'x3 = b * x2 + d * x4',
      'x4 = c * x3'
    ],
    start: 'x1',
    end: 'x4',
    n: 'a * b * c',
    d: '1 - c * d - b * c * e'
  },
  { // 3
    equations: [
      'x2 = a * x1 + e * x3',
      'x3 = b * x2',
      'x4 = d * x1 + c * x3'
    ],
    start: 'x1',
    end: 'x4',
    n: 'd * (l - b * e) + a * b * c',
    d: 'l - b * e'
  },
  { // 4
    equations: [
      'x2 = e * x3 + l * x1 + d * x4',
      'x3 = b * x2 + f * x4',
      'x4 = a * x2 + c * x3',
      'x5 = l * x4'
    ],
    start: 'x1',
    end: 'x5',
    n: 'a + b * c',
    d: 'l - a * d - b * e - c * f - b * c * d - a * f * e'
  },
  { // 5
    equations: [
      'x2 = l * x1 + d * x3 + f * x4',
      'x3 = a * x2 + e * x4',
      'x4 = b * x3 + c * x2',
      'x5 = l * x4'
    ],
    start: 'x1',
    end: 'x5',
    n: 'c + a * b',
    d: 'l - a * d - b * e - a * b * f - c * e * d - c * f'
  },
  { // 6
    equations: [
      'x2 = a * x1',
      'x3 = b * x2',
      'x4 = c * x3',
      'x5 = d * x4',
      'x6 = e * x5',
      'x7 = f * x6',
      'x8 = g * x7',
      'x9 = h * x8'
    ],
    start: 'x1',
    end: 'x9',
    n: 'a * b * c * d * e * f * g * h',
    d: '1'
  },
  { // 7
    equations: [
      'x1 = a * x2'
    ],
    start: 'x1',
    end: 'x2',
    n: 'a',
    d: '1'
  }
];