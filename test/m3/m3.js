const assert = require('assert');
const suite = require('./suite');
const {netlists, circuits} = require('./tests');
const algebra = require('algebra.js');

/**
 * netlist -> nlConsume();
 *
 * TODO
 * 1. For each test case in tests.js verify the output given by nlConsume() function
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
    it ('correctness 1 - no sources', () => test_netlist(netlists[0]));
    it ('correctness 2 - independent source', () => test_netlist(netlists[1]));
    it ('correctness 3 - all supported types', () => test_netlist(netlists[2]));
    it ('correctness 4 - invalid 1', () => test_netlist(netlists[3]));
    it ('correctness 5 - invalid 2', () => test_netlist(netlists[4]));
  });

});