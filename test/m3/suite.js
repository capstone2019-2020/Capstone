const {Equation, Expression} = require('algebra.js');
const {validate} = require('jsonschema');
const DEBUG = process.env.M3_LOG_LEVEL;

const debug_log = (...params) => {
  if (DEBUG) {
    console.log(...params);
  }
}

/**
 *
 * @param output
 * @param expected
 * @returns true if output matches expected, false otherwise
 */
exports.verifyNetList = function (output, expected) {
  let valid = true;
  let actual = {};

  // TODO validate schema of output

  output.forEach(elem => actual[elem.id] = elem);
  expected.forEach(ans_ele => {
    let ele = actual[ans_ele.id];
    if (!ele) { /* Element with id does not exist in output */
      debug_log(`ERROR: Expected element with id ${ans_ele.id}!`);
      valid = false;
      return;
    }

    if (ans_ele.type !== ele.type || ans_ele.pnode !== ele.pnode
      || ans_ele.nnode !== ele.nnode || ans_ele.value !== ele.value) {
      debug_log(`ERROR: Expected ${JSON.stringify(ans_ele)} -> Actual ${JSON.stringify(ele)}`);
      valid = false;
      return;
    }
  });

  return valid;

};