const assert = require('assert');
const math = require('mathjs');
const fs = require('fs');

const { Expression } = require('../../src/RWalgebra.js');

const OPS = ['*', '/', '+', '-'];
const __ROUND = (f) => parseFloat(Math.round(f*100)/100);
const FIXED = (f, d) => __ROUND(f).toFixed(d);

const DIGITS = n => n.toString().length;
const FRONT_PAD = (str, n, c) => {
  let pad = '';
  for (let i=0; i<n; i++) {
    pad+=c;
  }
  return pad+str;
};
const RAND = (min, max) => Math.floor(Math.random() * (max - min) ) + min;
const RANDF = (min, max) => Math.random() * (max - min) + min;
const RANDB = () => Math.round(Math.random());
const RAND_OP = () => OPS[RAND(0, OPS.length)];
const TERM = (key, deg) => deg === 1 ? key : `${key}^${deg}`;
const CONCAT = (str, op, key) => str.length > 0 ? `(${str}) ${op} (${key})` : key;
const REPLACE_ALL = (src, match, dest) => src.replace(new RegExp(match, 'g'), dest);

const TEST_EXPONENTS = false;
const MAX_EVAL_VAL = 100;
const OUTPUT_FILE_PATH = './output.txt';

function __generate__(maxNTerms, nTerms, nDegrees, terms) {
  let rand = RAND(0, nTerms);
  rand = FRONT_PAD(rand.toString(),
    DIGITS(maxNTerms-1)-DIGITS(rand), '0');

  let term, termVal, key = `x${rand}`;
  if (nTerms === 1) {
    if (RANDB()) {
      if (!terms.hasOwnProperty(key)) {
        terms[key] = RAND(1, MAX_EVAL_VAL);
      }

      term = terms[key];
      termVal = TERM(key, TEST_EXPONENTS ?
        FIXED(RANDF(0, nDegrees), 2) : 1);
      return {
        str: termVal, val: term.toString()
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
  for (i=0; i<r; i++) {
    op = RAND_OP();

    if (RANDB()) { /* is variable, add to terms */
      if (!terms.hasOwnProperty(key)) {
        terms[key] = RAND(1, MAX_EVAL_VAL);
      }
      term = terms[key];
      termVal = TERM(key, TEST_EXPONENTS ?
        FIXED(RANDF(0, nDegrees), 2) : 1);
      evalStr = CONCAT(evalStr, op, term.toString());
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
  } = __generate__(maxNTerms, nTerms-r, nDegrees, terms);

  op = RAND_OP();
  compiled = math.compile(CONCAT(eval, op, genVal));
  return {
    str: CONCAT(str, op, genStr),
    val: compiled.evaluate().toString()
  };
}

function __simple__(nTerms, terms, isImag=false) {
  let term, key, evalExpr = '', expr = '', _term, op;
  let i;
  for (i=0; i<nTerms; i++) {
    let rand = RAND(0, nTerms);
    key = `x${FRONT_PAD(rand.toString(),
      DIGITS(nTerms-1)-DIGITS(rand), '0')}`;
    if (!terms.hasOwnProperty(key)) {
      terms[key] = RAND(1, MAX_EVAL_VAL);
    } else {
      term = terms[key];
    }

    _term = `${RAND(1, MAX_EVAL_VAL)} * ${key}`;
    op = RANDB() ? '+' : '-';
    if (evalExpr.length === 0) {
      evalExpr = _term;
    } else {
      evalExpr = `${evalExpr} ${op} ${_term}`;
    }

    if (isImag) {
      _term = `${_term} * j`;
      if (expr.length === 0) {
        expr = _term;
      } else {
        expr = `${expr} ${op} ${_term}`;
      }
    } else {
      expr = evalExpr;
    }
  }

  for (let [k, v] of Object.entries(terms)) {
    evalExpr = REPLACE_ALL(evalExpr, k, v);
  }
  let compiled = math.compile(evalExpr);

  return {
    str: expr, evalStr: evalExpr, val: compiled.evaluate()
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
  const __assert__ = (str, val, terms) => {
    if (!isFinite(val)) return;

    for (let [k, v] of Object.entries(terms)) {
      str = REPLACE_ALL(str, k, v);
    }

    compiled = math.compile(str);
    assert(FIXED(compiled.evaluate(), 2) === FIXED(val, 2));
  };

  let gen, terms, compiled;
  let i;
  for (i=1; i<=500; i++) {
    terms = {};
    gen = __generate__(i, i, 1, terms);
    __assert__(gen.str, gen.val, terms);
    if (i%10 === 0) {
      process.stdout.write('.');
    }
  }
  process.stdout.write('\n');

  let simple;
  for (i=1; i<=500; i++) {
    terms = {};
    simple = __simple__(i, terms, false);

    __assert__(simple.str, simple.val, terms);
    if (i%10 === 0) {
      process.stdout.write('.');
    }
  }
  process.stdout.write('\n');

  for (i=1; i<=500; i++) {
    terms = {};
    simple = __simple__(i, terms, true);

    __assert__(simple.evalStr, simple.val, terms);
    if (i%10 === 0) {
      process.stdout.write('.');
    }
  }
}

function __test_that__(expr, terms, expected, isImag=false) {
  if (!isFinite(expected)) {
    return;
  }

  let rwExpr = new Expression(expr);
  let errMsg = '', actual;
  try {
    actual = rwExpr.eval(terms);
    if (isImag) {
      actual = actual.imag.constant;
    }
  } catch (err) {
    errMsg = err.message;
  }

  if (errMsg.length || FIXED(actual, 4) !== FIXED(expected, 4)) {
    let output = `
    \n========================================= \
    \nEquation: \n${expr}                       \
    \nExpected: ${expected}, Actual: ${actual}  \
    \nErrors(s): ${errMsg}
    \nTerms: ${JSON.stringify(terms)}           \
    \n========================================= \
    `;

    fs.appendFileSync(OUTPUT_FILE_PATH, output);
    throw new Error('test failed');
  }
}

describe('m5 math utilities library tests', function() {
  before(function() {
    this.timeout(0);
    try {
      fs.unlinkSync(OUTPUT_FILE_PATH);
    } catch (err) {
      /* swallow exception */
    }
    console.log('m5 verifying internal test library');
    __internal__();
    console.log('\nm5 internal test passed');
  });

  const MAX_ITERS_EASY = 30;
  const MAX_ITERS_MED = 200;
  const MAX_ITERS_HARD = 500;
  const NUM_TERMS_FUNC = 20;

  describe('functionality', function() {
    it('real', function() {
      let i, simple, terms;
      for (i=0; i<MAX_ITERS_EASY; i++) {
        terms = {};
        simple = __simple__(NUM_TERMS_FUNC, terms, false);
        __test_that__(simple.str, terms, simple.val);
      }
    });
    it('imaginary', function() {
      let i, simple, terms;
      for (i=0; i<MAX_ITERS_EASY; i++) {
        terms = {};
        simple = __simple__(NUM_TERMS_FUNC, terms, true);
        __test_that__(simple.str, terms, simple.val, true);
      }
    });
    it('easy', function() {
      let i, simple, terms;
      for (i=1; i<=MAX_ITERS_EASY; i++) {
        terms = {};
        simple = __simple__(i, terms, false);
        __test_that__(simple.str, terms, simple.val);
      }
    });
    it('medium', function() {
      let i, simple, terms;
      for (i=1; i<=MAX_ITERS_MED; i++) {
        terms = {};
        simple = __generate__(i, i, 1, terms);
        __test_that__(simple.str, terms, simple.val);
      }
    });
    it('hard', function() {
      let i, simple, terms;
      for (i=1; i<=MAX_ITERS_HARD; i++) {
        terms = {};
        simple = __generate__(i, i, 1, terms);
        __test_that__(simple.str, terms, simple.val);
      }
    });
  });
});
