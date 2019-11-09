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
    const circuit = nlConsume(nl.filepath);
    assert.ok(suite.verifyNetlist(circuit, nl.data));
  };

  decribe('func', function() {
    it ('correctness 1', () => test_netlist(netlists[0]));
  })

});