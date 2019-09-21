const assert = require('assert');

// run private tests to make sure testing framework is working
(function test_suite() {
  let verify = true;
  if (!verify) {
    console.log('PANIC: internal test suite is not working as expected!');
    process.exit(1);
  }
})();

/**
 * computeSFG is the trickier one to test since we need to somehow
 * verify the correctness of the output SFG. Want to avoid hardcoding
 * tests as much as possible as this hinders scalability of testing.
 * But for now, it seems like the only solution.
 * 
 * Inputs can be formed from a system of equations represented through
 * generation of size-n square matrice A, each matrix element can be 
 * in Algebra.js equation format.
 * AX = B (where A is the square nxn matrix, X = nx1, B = nx1)
 * Each variable can be isolated through taking the inverse matrix.
 */
describe('computeSFG()', function() {
  describe('func', function() {
    it ('input/output', function() {

    });
    it ('correctness 1', function() {

    });
    it ('correctness 2', function() {

    });
    it ('correctness 3', function() {

    });
  });
  describe('perf', function() {
    it('easy', function() {

    });
    it('medium', function() {

    });
    it ('hard', function() {

    });
  });
});

/*
 * This is very easy to test on a general level. Solve size-n square
 * matrix representation of system of equations. Simplify or compute
 * variety of values to test whether the given transfer function gives
 * the same result.
 */
describe('computeMasons()', function() {
  describe('func', function() {
    it ('input/output', function() {

    });
    it ('correctness 1', function() {

    });
    it ('correctness 2', function() {

    });
    it ('correctness 3', function() {

    });
  });
  describe('perf', function() {
    it('easy', function() {

    });
    it('medium', function() {

    });
    it ('hard', function() {

    });
  });
});

/*
 * Step 1: SFG = computeSFG()
 * Step 2: computeMasons(SFG, ...)
 * 
 * Also easy to test, pass in system of equations, which can be solved
 * through non-SFG means, compare this result with the result yielded
 * from computeMasons().
 */
describe('integration', function() {
  describe('func', function() {
    it ('input/output', function() {

    });
    it ('correctness 1', function() {

    });
    it ('correctness 2', function() {

    });
    it ('correctness 3', function() {

    });
  });
  describe('perf', function() {
    it('easy', function() {

    });
    it('medium', function() {

    });
    it ('hard', function() {

    });
  });
});