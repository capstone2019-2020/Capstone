const { Variable, Term } = require('./TermVariable.js');
const { Fraction } = require('./Fraction.js');
const { TOKEN_TYPES, tokenize } = require ('./token.js');
const { shuntingYard } = require('./parseHelper.js');

const ADD = '+';
const SUB = '-';
const MULT = '*';
const DIV = '/';
const POW = '^';
const IMAG_NUM = 'j';
const SUPPORTED_FUNCS = ['sin', 'cos', 'tan', 'log'];
const SUPPORTED_OPS = [ADD, SUB, MULT, DIV, POW];
const SUPPORTED_VAR_CHARS = ['_']; // special chars that are allowed in variable names

const DEBUG = 0;


const Expression = function (exp) {
  this.imag = { terms: [], constant: null };   /* List of Terms */
  this.real = { terms: [], constant: null };   /* List of Terms */

  if ( typeof exp === 'string' ) {
    const tokens = tokenize(exp);
    const parsed_data = this.parse(tokens);
    this.real= parsed_data.real;
    this.imag = parsed_data.imag;
  }
  else if ( typeof exp === 'number')
  {
    this.real.constant = parseFloat(exp);
  }
  else if (Array.isArray(exp) && exp[0] instanceof Term) { // array of Terms
    this.real.terms = filterOutConstantTerms(exp, false);
    this.real.constant = computeConstant(exp, false);
    this.imag.terms = filterOutConstantTerms(exp, true);
    this.imag.constant = computeConstant(exp, true);
  }
  else {
    throw new ArgumentsError('Invalid argument type for Expression object');
  }
};

/**
 * String parser that initializes the Expression data structure
 * Only called in the constructor when creating the Expression object
 *
 * @param tokens
 */
Expression.prototype.parse = (tokens => {
  /* Perform Shunting-Yard algorithm to convert tokens from in-fix to post-fix notation */
  const postFix = shuntingYard(tokens);
  if (DEBUG)
    console.log(postFix);

  /* Loop through all - the end result should be a single array of terms in the operand_stack */
  let operand_stack = [];
  let op1, op2;
  let term;
  postFix.forEach( t => {
    if (t.type === TOKEN_TYPES.OP) {
      op2 = operand_stack.pop();
      op1 = operand_stack.pop();
      let result = compute(op1, op2, t.value);
      operand_stack.push(result);
    }
    else if (t.type === TOKEN_TYPES.LITERAL) {
      term = new Term('');
      term.coefficient = parseFloat(t.value);
      operand_stack.push([term]);
    }
    else if (t.type === TOKEN_TYPES.VAR) {
      operand_stack.push([new Term(new Variable(t.value))]);
    }
    else if (t.type === TOKEN_TYPES.IMAG_LIT) {
      term = new Term('');
      term.coefficient = parseFloat(t.value);
      term.imag = true;
      operand_stack.push([term]);
    }
    else if (t.type === TOKEN_TYPES.IMAG_VAR) {
      term = new Term(new Variable(t.value));
      term.imag = true;
      operand_stack.push([term]);
    }
  });

  /* Must compute the constant term and filter out the constant terms from the result */
  // return {constant : computeConstant(operand_stack[0]), real: filterOutConstantTerms(operand_stack[0])};
  const real = {
    terms: filterOutConstantTerms(operand_stack[0], false),
    constant: computeConstant(operand_stack[0], false)
  };
  const imag = {
    terms: filterOutConstantTerms(operand_stack[0], true),
    constant: computeConstant(operand_stack[0], true)
  };
  return { real, imag };
});


/**
 * Given a list of terms, computes the constant term by adding all terms that do not contain any variables
 *
 * @param terms List of terms
 * @returns float if terms.length != 0, null otherwise
 */
const computeConstant = (terms, _imag) => {
  terms = terms.filter( t => !t.variables.length && typeof t.fraction.numer === 'number' && typeof t.fraction.denom === 'number' && t.imag === _imag);
  return terms.length ? terms.reduce( (acc, curr) => acc + curr.coefficient / curr.fraction.denom, 0) : null;
};

const filterOutConstantTerms = (terms, _imag) => {
  return terms.filter(t => (t.variables.length || typeof t.fraction.denom !== 'number') && t.imag === _imag);
};

/**
 * Returns a list of Term objects representing the computation of
 * op1 operator op2
 *
 * @param op1   - OPERAND 1, Type: List of Terms
 * @param op2   - OPERAND 2, Type: List of Terms
 * @param operator - String in [ + , - , * , / ]
 * TODO Add support for pow() and other functions, sin, cos, etc
 */
const compute = (op1, op2, operator) => {
  let result = [];
  switch (operator) {
    case (ADD):
      result = addTerms(op1, op2);
      break;
    case (SUB):
      result = subtractTerms(op1, op2); // op1 - op2
      break;
    case (MULT):
      result = multiplyTerms(op1, op2);
      break;
    case (DIV):
      result = divideTerms(op1, op2); // op1 / op2
      break;
    default: // do nothing
      break;
  }
  return result;
};


/** Helper functions to perform ADD, SUB, MULT, DIVIDE functions **/
const addTerms = (op1, op2) => {
  return op1.concat(op2);
};

const subtractTerms = (op1, op2) => {
  op2.forEach( t => {
    t.coefficient *= -1;
  });
  return op1.concat(op2);
};

const multiplyTerms = (op1, op2) => {
  let result = [];
  let temp_term;
  op1.forEach( t1 => {
    op2.forEach( t2 => {
      temp_term = new Term('');
      temp_term.variables = t1.variables.concat(t2.variables);
      temp_term.coefficient = t1.coefficient * t2.coefficient;
      if (t1.imag && t2.imag) // j * j = -1
        temp_term.coefficient *= -1;
      else if (t1.imag || t2.imag) // j * const  or const * j = imaginary term
        temp_term.imag = true;
      // TODO handle denominator multiplication
      result.push(temp_term);
    });
  });
  return result;
};

const divideTerms = (op1, op2) => {
  /* Case 1: term / term */
  if (op1.length === 1 && op2.length === 1) {
    /* if denom is a constant - just update the coefficient */
    if (computeConstant(op2, false) !== null) {
      op1[0].coefficient = op1[0].coefficient / computeConstant(op2, false);
      return op1;
    }

    op1[0].fraction.denom = new Expression(op2);
    return op1;
  }

  /* Case 3: multiple terms / term */
  else if (op1.length > 1 && op2.length === 1) {
    let _const = computeConstant(op2, false); // term is a constant
    op1.forEach( t => {
      if (_const !== null) {
        t.coefficient = t.coefficient /_const;
      } else {
        t.fraction.denom = new Expression(op2);
      }
    });
    return op1;
  }

  /* Case 4: term / multiple terms */
  else if (op1.length === 1 && op2.length > 1) {
    op1[0].fraction.denom = new Expression(op2);
    return op1;
  }

  /* Case 2: multiple terms / multiple terms */
  else if (op1.length > 1 && op2.length > 1) {
    op1.forEach( t => {
      t.fraction.denom = new Expression(op2);
    });
    return op1;
  }
};

module.exports = { Expression };

// Expression.prototype.toString = function () {
//   let retString = "";
//   for (var i = 0; i < this.terms.length; i++) {
//     var tempTerm = this.terms[i];

//     retString += (tempTerm.coefficient[0].valueOf() < 0 ? " - " : " + ") + tempTerm.toString();
//   }
// };


