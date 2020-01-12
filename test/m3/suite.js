const algebra = require('../../src/RWalgebra.js');
const {validate} = require('jsonschema');

const DEBUG = process.env.M3_LOG_LEVEL;
const RANDOM_SEED = 10000;

const debug_log = (...params) => {
  if (DEBUG) {
    console.log(...params);
  }
}

const CONVERSION_UNIT = {
  'G': 1000000000,
  'M': 1000000,
  'k': 1000,
  'm': 0.001,
  'u': 0.000001,
  'n': 0.000000001,
  'p': 0.000000000001
};

const Schema = function Schema() {
  return {
    Init: (rest) => ({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'srv-doc-processing-schema',
      ...rest,
    }),
    ObjectArray: (properties) => ({
      type: 'array',
      items: {
        type: 'object',
        properties: {...properties},
        additionalProperties: false,
        minProperties: Object.keys(properties).length,
      },
    }),
    StringArray: () => ({
      type: 'array',
      items: {type: 'string'},
    }),
    String: () => ({type: 'string'}),
    Boolean: () => ({type: 'boolean'}),
    PlainObject: () => ({type: 'object'}),
    Number: () =>({type: 'number'}),
  };
};


/**
 * Function to verify output of netlist.js -> nlConsume() function
 * Compares actual output with expected output as outlined in tests.js
 *
 * NOTE: due to issues with javascript floating point storage, could not
 *       hard-code the values defined in tests.js - have to do the parsing of
 *       the conversion units manually
 *
 * @param output - actual output obtained from nlConsume()
 * @param expected - expected output as defined in m3/test.js
 * @returns true if output matches expected, false otherwise
 */
exports.verifyNetList = function (output, expected) {
  let valid = true;
  let actual = {};

  /* Verify schema */
  let schema = Schema();
  try {
    validate(output, schema.Init(schema.ObjectArray({
      id: schema.String(),
      pnode: schema.Number(),
      nnode: schema.Number(),
      ctrlPNode: schema.String(),
      ctrlNNode: schema.String(),
      value: schema.Number()
    })));
  } catch {
    debug_log(`ERROR: Netlist data structure does not match schema!`);
    return false;
  }

  output.forEach(elem => actual[elem.id] = elem);
  expected.forEach(ans_ele => {
    let ele = actual[ans_ele.id];
    if (!ele) { /* Element with id does not exist in output */
      debug_log(`ERROR: Expected element with id ${ans_ele.id}!`);
      valid = false;
      return;
    }

    Object.keys(ans_ele).forEach(k => {
      /* Compute the expected value using conversion factor and compare*/
      if (k === 'value') {
        let value = ans_ele[k];
        let factor = value.slice(-1);
        factor = CONVERSION_UNIT.hasOwnProperty(factor) ? CONVERSION_UNIT[factor] : 1;
        value = parseFloat(value) * factor;

        if (value !== ele[k]) {
          debug_log(`ERROR: Expected ${JSON.stringify(ans_ele)} -> Actual ${JSON.stringify(ele)}`);
          valid = false;
          return;
        }
      }

      /* Verify expected property matches actual */
      else if (!ele.hasOwnProperty(k) || ans_ele[k] !== ele[k]) {
        debug_log(`ERROR: Expected ${JSON.stringify(ans_ele)} -> Actual ${JSON.stringify(ele)}`);
        valid = false;
        return;
      }
    })
  });
  return valid;
};


const generate_variable_map = (eqn) => {
  const rhs = eqn.rhs;
  let result = {};
  rhs.real.terms.forEach((term) => {
    term.variables.forEach((v) => {
      result[v.name] = Math.round(Math.random() * RANDOM_SEED);
    })
  });
  // debug_log(`Variable map for eqn ${eqn.toString()}: `, JSON.stringify(result));
  return result
}

/**
 * Used to verify the equations produced by circuit.js -> nodalAnalysis() function
 *
 * NOTE: Assumes that
 *
 * @param output
 * @param expected
 * @returns true if actual output matches expected
 */
exports.verifyCircuit = function(output, expected) {
  // debug_log(output, expected);

  /**
   * Step 1: Convert equations into algebra.js Equations
   */
  let actual_eqns = [];
  let expected_eqns = [];

  expected.forEach((node_eqns) => {
    expected_eqns.push(node_eqns.map( x => algebra.parse(x)));
  });

  output.forEach((node_eqns) => {
    actual_eqns.push(node_eqns.map( x => algebra.parse(x)));
  });

  /* Step 2: Loop through all the equations, verify that they match */
  let i, j;
  let anode, enode, node_eqn1, node_eqn2; // list of node equations
  for (i = 0; i < expected_eqns.length; i++) {
    anode = actual_eqns[i];
    enode = expected_eqns[i];

    /* Verify Equations for the node exists */
    if (!anode) {
      debug_log(`ERROR: Missing equations for Node ${i}`,
        `Expected: ${JSON.stringify(expected)}`,
        `Actual: ${JSON.stringify(output)}`);
      return false;
    }

    /* Verify number of equations */
    if (enode.length !== anode.length) {
      debug_log(`ERROR: Expected ${enode.length} equations, received `,
        `Expected: ${JSON.stringify(expected)}`,
        `Actual: ${JSON.stringify(output)}`);
      return false;
    }

    let result1 = {}
    let result2 = {}
    /* Verify equations match the expected */
    for (j = 0; j < enode.length; j++) {
      node_eqn1 = anode[j];
      node_eqn2 = enode[j];

      // 1. generate a map of values for variables in rhs
      // 2. evaluate (use algebra.js evaluate method)
      const variable_map = generate_variable_map(node_eqn2);
      let val1 = parseFloat(node_eqn1.rhs.eval(variable_map));
      let val2 = parseFloat(node_eqn2.rhs.eval(variable_map));

      /* Assume that the last equation will always be of the form Ix - Iy + Iz... = 0 */
      if (j !== enode.length-1) {
        result1[node_eqn1.lhs.real.terms[0].variables[0].name] = val1;
        result2[node_eqn2.lhs.real.terms[0].variables[0].name] = val2;
      } else {
        val1 = parseFloat(node_eqn1.lhs.eval(result1));
        val2 = parseFloat(node_eqn2.lhs.eval(result2));
      }

      if ( val1 !== val2 ){
        debug_log(`ERROR: Equations don't match\n { expected: ${expected[i][j]}, actual: ${output[i][j]} }`);
        return false;
      }
    }
    return true;
  }
};