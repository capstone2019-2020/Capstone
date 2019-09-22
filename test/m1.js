const assert = require('assert');
const suite = require('./suite');
const {equations} = require('./tests');
const algebra = require('algebra.js');

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

    const alg_equations = equations.map(eq_obj =>
      eq_obj.equations.map(e => algebra.parse(e))
    );

    describe('func', function() {
      it ('correctness 1', function() {
        const test_eqns = [alg_equations[1], alg_equations[6], alg_equations[7]];
        test_eqns.forEach(equations => {
          const output = computeSFG(equations);
          assert.ok(suite.verify_sfg(output, suite.simple_sfg(equations)));
        });
      });
      it ('correctness 2', function() {
        const test_eqns = [alg_equations[0], alg_equations[2], alg_equations[3],
          alg_equations[4], alg_equations[5]];

        test_eqns.forEach(equations => {
          const output = computeSFG(equations);
          assert.ok(suite.verify_sfg(output, suite.simple_sfg(equations)));
        });
      });
      it ('correctness 3', function() {
        // test large input
        const eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(50));
        const output = computeSFG(eqns);
        assert.ok(suite.verify_sfg(output, suite.simple_sfg(eqns)));
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
            eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(I));
            start = process.hrtime.bigint();
            const output = computeSFG(eqns);
            end = process.hrtime.bigint();

            let t = end - start; // nanoseconds
            total += t;
            highest = highest > t ? highest : t;
            lowest = lowest < t ? lowest : t;

            assert.ok(suite.verify_sfg(output, suite.simple_sfg(eqns)));
          } catch (err) {
            throw err;
          }
        }
        return suite.perf_stats(highest, lowest, total, BigInt(I));
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
  const {computeMasons} = require('../src/m1');

  const alg_equations = equations.map(eq_obj => ({
    equations: eq_obj.equations.map(e => algebra.parse(e))
    start: eq_obj.start,
    end: eq_obj.end,
    n: algebra.parse(eq_obj.n),
    d: algebra.parse(eq_obj.d)
  }));

  describe('func', function() {
    it ('correctness 1', function() {
      const test_eqns = [alg_equations[1], alg_equations[6], alg_equations[7]];
      test_eqns.forEach(alg_eqn => {
        const sfg = suite.simple_sfg(alg_eqn.equations);
        const {n, d} = computeMasons(sfg, alg_eqn.start, alg_eqn.end);
        assert.ok(suite.verify_masons(n, d, alg_eqn.n, alg_eqn.d));
      });
    });
    it ('correctness 2', function() {
      const test_eqns = [alg_equations[0], alg_equations[2], alg_equations[3],
        alg_equations[4], alg_equations[5]];
      test_eqns.forEach(alg_eqn => {
        const sfg = suite.simple_sfg(alg_eqn.equations);
        const {n, d} = computeMasons(sfg, alg_eqn.start, alg_eqn.end);
        assert.ok(suite.verify_masons(n, d, alg_eqn.n, alg_eqn.d));
      });
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

    const perf_computeMasons = (I) => {
      let total = BigInt(0), highest = BigInt(0), lowest = BigInt(0);
      let start, end;
      let eqns, sfg;

      for (let i = 0; i < I; i++) {
        try {
          eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(I_EASY));
          sfg = suite.simple_sfg(eqns);

          start = process.hrtime.bigint();
          computeMasons(sfg, 'x_0', `x_${eqns.length - 1}`);
          end = process.hrtime.bigint();

          let t = end - start; // nanoseconds
          total += t;
          highest = highest > t ? highest : t;
          lowest = lowest < t ? lowest : t;
        } catch (err) {
          throw err;
        }
      }
      return suite.perf_stats(highest, lowest, total, BigInt(I));
    };

    it('easy', function() {
      let result;
      try {
        result = perf_computeMasons(I_EASY);
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
        result = perf_computeMasons(I_MED);
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
        result = perf_computeMasons(I_HARD);
      } catch (err) {
        assert.ok(false);
      }

      this.timeout(100000);
      assert.ok(result.highest < MAX_SINGLE_EXEC
        && result.total < MAX_TOTAL_EXEC_HARD
      );
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
