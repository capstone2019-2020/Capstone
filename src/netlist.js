const fs = require('fs');

const MAX_SUPPORTED_PARAMS = 4;
const DEBUG = 1;
const SUPPORTED_TYPES = [ 'R', 'L', 'C', 'I', 'V', 'ID', 'VD' ];
const MULTIPLIER_LUT = {
  'k': 1000,
  'M': 1000000,
  'G': 1000000000,
  'm': 0.001,
  'u': 0.000001,
  'n': 0.000000001,
  'p': 0.000000000001
};

function assertSchema(components) {
  let i, j, c;
  for (i = 0; i < components.length; i++) {
    c = components[i];
    for (j = i+1; j < components.length; j++)
      assert(c.id !== components[j].id);
  }

  components.forEach(component =>
    assert(SUPPORTED_TYPES.includes(component.type))
  );
}

/*
 * Input: file path containing netlist,
 * @return <Components>
 */
exports.nlConsume = filepath => {
  const components = [];
  const d = fs.readFileSync(filepath, {encoding: 'utf8'});

  const arr = d.split('\n');

  let a, i, line, val, multiplier;
  for (i = 0; i < arr.length; i++) {
    if (!(line = arr[i]).length) {
      continue;
    }

    a = line.replace(/[!@#$%^&*\r]/g, '')
      .trim().split(' ');

    if (a.length !== MAX_SUPPORTED_PARAMS) {
      console.log('WARN: invalid input');
    }

    multiplier = a[3].slice(-1);
    if (MULTIPLIER_LUT.hasOwnProperty(multiplier)) {
      multiplier = MULTIPLIER_LUT[multiplier];
      val = parseFloat(a[3].slice(0, -1));
    } else {
      multiplier = 1;
      val = parseFloat(a[3]);
    }

    components.push({
      id: a[0],
      type: a[0][0],
      pnode: parseInt(a[1]),
      nnode: parseInt(a[2]),
      value: val * multiplier
    });
  }

  if (DEBUG) {
    assertSchema(components);
  }
  return components;
};
