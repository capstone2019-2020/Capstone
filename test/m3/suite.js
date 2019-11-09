const {Equation, Expression} = require('algebra.js');
const {validate} = require('jsonschema');
const DEBUG = process.env.M3_LOG_LEVEL;

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

/**
 * Used to verify the equations produced by circuit.js -> nodalAnalysis() function
 *
 * @param output
 * @param expected
 * @returns true if actual output matches expected
 */
exports.verifyCircuit = function(output, expected) {

};