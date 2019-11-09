const {Equation, Expression} = require('algebra.js');
const {validate} = require('jsonschema');
const DEBUG = process.env.M3_LOG_LEVEL;

const debug_log = (...params) => {
  if (DEBUG) {
    console.log(...params);
  }
}

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
 *
 * @param output
 * @param expected
 * @returns true if output matches expected, false otherwise
 */
exports.verifyNetList = function (output, expected) {
  let valid = true;
  let actual = {};

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
      if (!ele.hasOwnProperty(k) || ans_ele[k] !== ele[k]) {
        debug_log(`ERROR: Expected ${JSON.stringify(ans_ele)} -> Actual ${JSON.stringify(ele)}`);
        valid = false;
        return;
      }
    })
  });

  return valid;

};