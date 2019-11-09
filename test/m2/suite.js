const {Equation, Expression} = require('algebra.js');
const {validate} = require('jsonschema');


exports.verifyNetList = function (output, expected) {
  let valid = true;

  let expectedElems = {};

  // TODO need to check for invalid case - should throw error

  expected.forEach(elem => expectedElems[elem.id] = elem);
  expectedElems.forEach(ans_ele => {
    let ele = output[ans_ele.id];
    if (!ele) { /* Element with id does not exist in output */
      // TODO output a message
      valid = false;
      return;
    }

    if (ans_ele.type !== ele.type) {
      valid = false;
      return;
    }
    if (ans_ele.pnode !== ele.pnode) {
      valid = false;
      return
    }
    if (ans_ele.nnode !== ele.nnode) {
      valid = false;
      return;
    }
    if (ans_ele.value !== ele.value) {
      valid = false;
      return;
    }
  });

};