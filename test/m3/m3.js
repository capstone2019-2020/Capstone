const assert = require('assert');
const suite = require('./suite');
const {netlists, circuits} = require('./tests');
const algebra = require('algebra.js');

/**
 * netlist -> nlConsume();
 *
 * Verifies the following cases for netlist parsing functionality:
 *  1. RLC circuit with independent source
 *  2. RLC circuit with dependent source
 *  3. Circuit containing all supported types: R, L, C,
 *      independent voltage + current sources,
 *      depdendent voltage + current sources
 *  4. Invalid netlist inputs:
 *    - Unsupported types (i.e. not one of R, L, C, I, V, E, G)
 *    - Too many arguments (> 5)
 * Hardcoded the test cases - all can be found in test/m3/test.js
 *
 * Input: Filepath
 * Output: Circuit data structures obtained from net list
 */
describe('nlConsume()', function() {
  const {nlConsume} = require('../../src/netlist');

  const test_netlist = nl => {
    let circuit;
    try {
      circuit = nlConsume(nl.filepath);
    } catch {
      assert.ok(nl.data.length == 0); // only throw an error if the expected output is empty - i.e. invalid input
      return;
    }
    assert.ok(suite.verifyNetList(circuit, nl.data));
  };

  describe('func', function() {
    it ('correctness 1 - independent source', () => test_netlist(netlists[0]));
    it ('correctness 2 - dependent source', () => test_netlist(netlists[1]));
    it ('correctness 3 - all supported types', () => test_netlist(netlists[2]));
    it ('correctness 4 - invalid 1', () => test_netlist(netlists[3]));
    it ('correctness 5 - invalid 2', () => test_netlist(netlists[4]));
  });

});

/**
 * circuit.js -> nodalAnalysis()
 */
describe('nodalAnalysis()', function () {
  const circuit = require('../../src/circuit');
  console.log(circuit);

  const test_nodalAnalysis = (expected) => {
    const c = circuit.createCircuit(expected.c);
    circuit.setCircuit(c);
    const eqns = c.nodalAnalysis().currentEquations[0];
    assert.ok(suite.verifyCircuit(eqns, expected.eqns));
  };

  describe('func', function() {
    it ('correctness 1 - BASIC: independent voltage src', () => test_nodalAnalysis(circuits[0]));
    it ('correctness 2 - BASIC: independent current src', () => test_nodalAnalysis(circuits[1]));
    it ('correctness 3 - BASIC: all independent srcs', () => test_nodalAnalysis(circuits[2]));
    it ('correctness 4 - MED: all independent srcs', () => test_nodalAnalysis(circuits[3]));
  });
});