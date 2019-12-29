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


const Expression = function (exp) {
  this.imag = [];   /* List of Terms */
  this.real = [];   /* List of Terms */
  this.constant = null; /* List of integers/floats */

  if ( typeof exp === 'string' ) {
    const tokens = tokenize(exp);
    const parsed_data = this.parse(tokens);
    this.real = parsed_data.real;
    this.constant = parsed_data.constant;
  }
  else if ( typeof exp === 'number')
  {
    this.constant = parseFloat(exp);
  }
  else if (Array.isArray(exp) && exp[0] instanceof Term) {
    this.real = filterOutConstantTerms(exp);
    this.constant = computeConstant(exp);
  }
  else {
    throw new ArgumentsError('Invalid argument type for Expression object');
  }
};

const flatten = (arr) => {
  return arr.reduce((acc, val) => acc.concat(val), []);
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
      operand_stack.push(term);
    }
    else if (t.type === TOKEN_TYPES.VAR) {
      operand_stack.push(new Term(new Variable(t.value)));
    }
  });

  /* Must compute the constant term and filter out the constant terms from the result */
  return {constant : computeConstant(operand_stack[0]), real: filterOutConstantTerms(operand_stack[0])};
});


const computeConstant = (terms) => {
  if (!Array.isArray(terms))
    terms = [terms];
  terms = terms.filter( t => !t.variables.length && typeof t.fraction.numer === 'number' && typeof t.fraction.denom === 'number');
  return terms.length ? terms.reduce( (acc, curr) => acc + curr.coefficient / curr.fraction.denom, 0) : null;
};

const filterOutConstantTerms = (terms) => {
  if (!Array.isArray(terms))
    terms = [terms];
  return terms.filter(t => t.variables.length || typeof t.fraction.denom !== 'number');
};

/**
 * Returns a list of Term objects representing the computation of
 * op1 operator op2
 *
 * @param op1   - OPERAND 1
 * @param op2   - OPERAND 2
 * @param operator
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

const addTerms = (op1, op2) => {
  return flatten([op1, op2]);
};

const subtractTerms = (op1, op2) => {
  /* Case 1: subtracting a single term - just have to update the coefficient*/
  if (!Array.isArray(op2)) {
    op2.coefficient *= -1;
  }
  /* Case 2: subtracting multiple terms - have to update coefficients for each term*/
  else {
    op2.forEach( t => {
      t.coefficient *= -1;
    });
  }
  return flatten([op1, op2]);
};

const multiplyTerms = (op1, op2) => {
  /* Case 1: term * term - result = single term --> result stored in op1 */
  if (op1 instanceof Term && op2 instanceof Term) {
    op1.variables = op1.variables.concat(op2.variables);
    op1.coefficient *= op2.coefficient;
    // TODO handle denominator multiplication
    return [op1];
  }

  /* Case 2: multiple terms * multiple terms */
  else if (Array.isArray(op1) && Array.isArray(op2)) {
    let result = [];
    let temp_term;
    op1.forEach( t1 => {
      op2.forEach( t2 => {
        temp_term = new Term('');
        temp_term.variables = t1.variables.concat(t2.variables);
        temp_term.coefficient = t1.coefficient * t2.coefficient;
        // TODO handle denominator multiplication
        result.push(temp_term);
      });
    });
    return result;
  }

  /* Case 3: Multiple terms * single term */
  else {
    /* Standard: op1 = array, op2 = op1 = term*/
    if (Array.isArray(op2)) {
      let temp = op2;
      op2 = op1;
      op1 = temp;
    }
    op1.forEach( t => {
      t.variables = t.variables.concat(op2.variables);
      t.coefficient *= op2.coefficient;
      // TODO handle denominator multiplication
    });
    return op1;
  }
};

const divideTerms = (op1, op2) => {
  /* Case 1: term / term */
  if (op1 instanceof Term && op2 instanceof Term) {
    /* if denom is a constant - just update the coefficient */
    if (computeConstant([op2]) !== null) {
      op1.coefficient = op1.coefficient / computeConstant([op2]);
      return [op1];
    }

    op1.fraction.denom = new Expression([op2]);
    return [op1];
  }

  /* Case 2: multiple terms / multiple terms */
  else if (Array.isArray(op1) && Array.isArray(op2)) {
    op1.forEach( t => {
      t.fraction.denom = new Expression(op2);
    });
    return op1;
  }

  /* Case 3: multiple terms / term */
  else if (Array.isArray(op1) && op2 instanceof Term) {
    let _const = computeConstant([op2]); // term is a constant
    op1.forEach( t => {
      if (_const !== null) {
        t.coefficient = t.coefficient /_const;
      } else {
        t.fraction.denom = new Expression([op2]);
      }
    });
    return op1;
  }

  /* Case 4: term / multiple terms*/
  else if (op1 instanceof Term && Array.isArray(op2)) {
    op1.fraction.denom = new Expression(op2);
    return [op1];
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


