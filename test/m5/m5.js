const assert = require('assert');
const math = require('mathjs');

const { Expression } = require('../../src/RWalgebra.js');
const { Variable } = require('../../src/TermVariable.js');
const { tokenize } = require('../../src/token.js');

const {equations} = require('./tests');

const OPS = ['*', '/', '+', '-'];
const __ROUND = (f) => parseFloat(Math.round(f*100)/100);
const FIXED = (f, d) => __ROUND(f).toFixed(d);

const RAND = (min, max) => Math.floor(Math.random() * (max - min) ) + min;
const RANDF = (min, max) => Math.random() * (max - min) + min;
const RANDB = () => Math.round(Math.random());
const RAND_OP = () => OPS[RAND(0, OPS.length)];
const PUT = (arr, val) => arr.push(val);
const TERM = (key, deg) => deg === 1 ? key : `${key}^${deg}`;
const CONCAT = (str, op, key) => str.length > 0 ? `${str} ${op} ${key}` : key;

const TEST_EXPONENTS = false;
const MAX_EVAL_VAL = 100;

function __generate__(nTerms, nDegrees, terms) {
  let term, termVal;
  if (nTerms === 1) {
    if (RANDB()) {
      term = {
        name: `x${terms.length}`,
        val: RAND(1, MAX_EVAL_VAL)
      };
      PUT(terms, term);
      termVal = TERM(terms[terms.length-1].name, TEST_EXPONENTS ?
        FIXED(RANDF(0, nDegrees), 2) : 1);
      return {
        str: termVal, val: term.val.toString()
      };
    } else {
      termVal = RAND(1, MAX_EVAL_VAL).toString();
      return {
        str: termVal, val: termVal
      }
    }
  }

  let r = RAND(1, nTerms);
  let i, str = '', evalStr = '', op;
  let _terms = [];
  for (i=0; i<r; i++) {
    op = RAND_OP();

    if (RANDB()) { /* is variable, add to terms */
      term = {
        name: `x${terms.length}`,
        val: RAND(1, MAX_EVAL_VAL)
      };
      PUT(terms, term);
      PUT(_terms, term);
      termVal = TERM(terms[terms.length-1].name, TEST_EXPONENTS ?
        FIXED(RANDF(0, nDegrees), 2) : 1);
      evalStr = CONCAT(evalStr, op, term.val.toString());
    } else {
      termVal = RAND(1, MAX_EVAL_VAL).toString();
      evalStr = CONCAT(evalStr, op, termVal);
    }

    str = CONCAT(str, op, termVal);
  }

  let compiled = math.compile(evalStr);
  let eval = compiled.evaluate().toString();

  let {
    str: genStr, val: genVal
  } = __generate__(nTerms-r, nDegrees, terms);

  op = RAND_OP();
  compiled = math.compile(CONCAT(eval, op, genVal));
  return {
    str: `(${str}) ${op} (${genStr})`,
    val: compiled.evaluate().toString()
  };
}

function __internal__() {
  /*
   * Just a sanity check - to test if the generation function is
   * working as expected. This is a sanity check because we are
   * computing the equation's expected output as we build it and
   * now we check again if the recursively built equation corresponds
   * to the result equation.
   *
   * Test the generation function for up to 1000 terms and evaluate
   * whether answers match math.js's answers.
   */
  console.log('m5 internal test sanity check');
  let gen, terms, compiled, expr;
  let i;
  for (i=1; i<=1000; i++) {
    terms = [];
    gen = __generate__(i, 1, terms);

    expr = gen.str;
    terms.forEach(t => {
      expr = expr.replace(t.name, t.val)
    });
    compiled = math.compile(expr);

    assert(terms.length <= i);
    assert(FIXED(compiled.evaluate(), 2) === FIXED(gen.val, 2));
    if (i%10 === 0) {
      process.stdout.write('.');
    }
  }

  console.log('\nm5 internal test passed');
}

__internal__();

// describe('functionality', function() {
//   let ex;
//   it('parse', function() {
//     equations.forEach(e => {
//       ex = new Expression(e.e);
//       assert(e.e.replace(' ', '') === ex.toString().replace(' ', ''));
//     });
//   });
//   it('eval', function() {
//     equations.forEach(e => {
//       ex = new Expression(e.e);
//       assert(ex.eval(e.vars, false) === e.ans);
//     });
//   });
// });
