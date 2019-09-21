const assert = require('assert');
const suite = require('./suite');

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
  (() => {
    const {computeSFG} = require('../src/m1');

    describe('func', function() {
      it ('input/output', function() {
      });
      it ('correctness 1', function() {
        // tests basic case
        const eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(10));
        const output = computeSFG(eqns);
        const ans = suite.simple_sfg(eqns);

        assert.ok(suite.verify_sfg(output, ans));
      });
      it ('correctness 2', function() {
        // tests large input
        const eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(10));
        const output = computeSFG(eqns);
        const ans = suite.simple_sfg(eqns);

        assert.ok(suite.verify_sfg(output, ans));
      });
      it ('correctness 3', function() {
        // tests edge cases
        const eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(10));
        const output = computeSFG(eqns);
        const ans = suite.simple_sfg(eqns);

        assert.ok(suite.verify_sfg(output, ans));
      });
    });
    describe('perf', function() {
      // perf test metrics (time in ms), I = iterations & size of input
      const MAX_SINGLE_EXEC = 300;
      const MAX_TOTAL_EXEC_EASY = 5000;
      const MAX_TOTAL_EXEC_MED = 6000;
      const MAX_TOTAL_EXEC_HARD = 7000;
      const I_EASY = 30;
      const I_MED = 100;
      const I_HARD = 200;

      const perf_computeSFG = (I) => {
        let total = BigInt(0), highest = BigInt(0), lowest = BigInt(0);
        let start, end;
        let eqns;

        for (let i = 0; i < I; i++) {
          try {
            eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(I_EASY));
            start = process.hrtime.bigint();
            const output = computeSFG(eqns);
            end = process.hrtime.bigint();

            let t = end - start; // nanoseconds
            total += t;
            highest = highest > t ? highest : t;
            lowest = lowest < t ? lowest : t;

            const ans = suite.simple_sfg(eqns);
            if (!suite.verify_sfg(output, ans)) {
              throw new Error('Invalid SFG!');
            }
          } catch (err) {
            throw err;
          }
        }
        let stats = suite.perf_stats(highest, lowest, total, BigInt(I));
        return stats;
      };

      it('easy', function() {
        let result;
        try {
          result = perf_computeSFG(I_EASY);
        } catch (err) {
          assert.ok(false);
        }

        this.timeout(100000);
        assert.ok(result.highest < MAX_SINGLE_EXEC
          && result.total < MAX_TOTAL_EXEC_EASY
        );
      });
      it('medium', function() {
        let result;
        try {
          result = perf_computeSFG(I_MED);
        } catch (err) {
          assert.ok(false);
        }

        this.timeout(100000);
        assert.ok(result.highest < MAX_SINGLE_EXEC
          && result.total < MAX_TOTAL_EXEC_MED
        );
      });
      it ('hard', function() {
        let result;
        try {
          result = perf_computeSFG(I_HARD);
        } catch (err) {
          assert.ok(false);
        }

        this.timeout(100000);
        assert.ok(result.highest < MAX_SINGLE_EXEC
          && result.total < MAX_TOTAL_EXEC_HARD
        );
      });
    });
  })();
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
