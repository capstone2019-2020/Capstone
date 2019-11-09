const fs = require('fs');

const MAX_SUPPORTED_PARAMS = 6;
const R_t = 'R';
const L_t = 'L';
const C_t = 'C';
const V_t = 'V';
const I_t = 'I';
const VCVS_t = 'E';
const VCCS_t = 'G';
const SUPPORTED_TYPES = [R_t, L_t, C_t, I_t, V_t, VCVS_t, VCCS_t];
const CONVERSION_LUT = {
  'k': 1000,
  'M': 1000000,
  'G': 1000000000,
  'm': 0.001,
  'u': 0.000001,
  'n': 0.000000001,
  'p': 0.000000000001
};

// export these to be used in other modules
exports.TYPES = {R_t, L_t, C_t, V_t, I_t, VCVS_t, VCCS_t};

function assertComponents(components) {
  let i, j, c;
  for (i = 0; i < components.length; i++) {
    c = components[i];
    assert(SUPPORTED_TYPES.includes(c.type));

    // special check for dependent sources
    if ([VCVS_t, VCCS_t].includes(c.type)) {
      assert(c.ctrlPNode && c.ctrlNNode);
    } else {
      delete c.ctrlPNode;
      delete c.ctrlNNode;
    }

    // check for name uniqueness
    for (j = i+1; j < components.length; j++)
      assert(c.id !== components[j].id);
  }
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

    if (a.length > MAX_SUPPORTED_PARAMS) {
      console.log('WARN: invalid input');
    }

    multiplier = a[3].slice(-1);
    if (CONVERSION_LUT.hasOwnProperty(multiplier)) {
      multiplier = CONVERSION_LUT[multiplier];
      val = parseFloat(a[3].slice(0, -1));
    } else {
      multiplier = 1;
      val = parseFloat(a[3]);
    }

    // Check for dependent voltage source
    let cpnode, cnnode;
    if ([VCVS_t, VCCS_t].includes(a[0][0])) {
      assert(a.length === 6);
      cpnode = a[3];
      cnnode = a[4];
      val = a[5];
      multiplier = 1;
    }

    components.push({
      id: a[0],
      type: a[0][0],
      pnode: parseInt(a[1]),
      nnode: parseInt(a[2]),
      ctrlPNode: cpnode || undefined, // voltage dep sources only
      ctrlNNode: cnnode || undefined, // voltage dep source only
      value: val * multiplier
    });
  }

  assertComponents(components);
  return components;
};
