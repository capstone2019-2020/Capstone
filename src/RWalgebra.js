const { Variable, Term } = require('./TermVariable.js');
const { TOKEN_TYPES, tokenize } = require ('./token.js');
const { shuntingYard } = require('./parseHelper.js');

const ADD = '+';
const SUB = '-';
const MULT = '*';
const DIV = '/';
const POW = '^';
const EQUAL = '=';
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
    this.parse(tokens);
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
  else if (exp === undefined) {
    // do nothing
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
Expression.prototype.parse = function(tokens) {
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
      term = new Term();
      term.coefficient = parseFloat(t.value);
      operand_stack.push([term]);
    }
    else if (t.type === TOKEN_TYPES.VAR) {
      operand_stack.push([new Term(t.value)]);
    }
    else if (t.type === TOKEN_TYPES.IMAG_LIT) {
      term = new Term();
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
  this.termsToExpression(operand_stack[0]);
};


/**
 * Given a list of terms, computes the constant term by adding all terms that do not contain any variables
 *
 * @param terms List of terms
 * @returns float if terms.length != 0, null otherwise
 */
const computeConstant = (terms, _imag) => {
  terms = terms.filter( t => !t.variables.length && typeof t.fraction.numer === 'number' &&
    typeof t.fraction.denom === 'number' && t.imag === _imag && t.coefficient !== 0);
  return terms.length ? terms.reduce( (acc, curr) => acc + curr.coefficient / curr.fraction.denom, 0) : null;
};

const filterOutConstantTerms = (terms, _imag) => {
  return terms.filter(t => (t.variables.length || typeof t.fraction.denom !== 'number') && t.imag === _imag && t.coefficient !== 0 );
};

/**
 * Given a list of terms - combine likes terms
 * i.e. x + 2x -> 3x
 *
 * Note: if there are expressions in the denominator - will not combine
 * i.e. x / (x + 2) + x / ( x + 3) -> no simplification
 *
 * @param terms
 */
const simplify = (terms) => {
  let vars = { }; // key = var name, val = Term object
  let f = [];
  let v_names;
  terms.forEach( t => {
    v_names = t.variables.map(v => v.name).join('') + t.imag;
    if (!vars[v_names])
      vars[v_names] = t;
    else  { // need to combine variables
      let _t = vars[v_names];
      if (typeof t.fraction.denom === 'number') {
        _t.coefficient += t.coefficient;
      } else {
        f.push(t);
      }
    }
  });

  return Object.keys(vars).map( v => vars[v]).concat(f);
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
  return simplify(result);
};


/**
 * Helper functions to perform ADD, SUB, MULT, DIVIDE functions
 * Each takes 2 arguments: op1, op2 -- both are a LIST OF TERMS
 * **/
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
      temp_term = new Term();
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

// TODO if imaginary number in denominator, multiply by conjugate of denominator
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

  /* Case 2: multiple terms / term */
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

  /* Case 3: term / multiple terms */
  else if (op1.length === 1 && op2.length > 1) {
    op1[0].fraction.denom = new Expression(op2);
    return op1;
  }

  /* Case 4: multiple terms / multiple terms */
  else if (op1.length > 1 && op2.length > 1) {
    op1.forEach( t => {
      t.fraction.denom = new Expression(op2);
    });
    return op1;
  }
};

/**
 * EXPRESSION INTERFACE FUNCTIONS
 * Valid Inputs:
 * *  Variable ('x', 'y', 'z')
 * *  Expression/ string of an expression
 * *  Constant - Integer/floating point
 */
Expression.prototype.add = function(op) {
  if (typeof op === 'number')
    this.real.constant += op;
  else if (op instanceof Variable) { // variables can only be real
    this.real.terms.push(new Term(op));
  }
  else if (op instanceof Term) {
    if (op.imag)
      this.imag.terms.push(op);
    else
      this.real.terms.push(op);
  }
  else  {
    if (typeof op !== 'string' && !(op instanceof Expression))
      throw new ArgumentsError('Invalid arguments');
    let exp = typeof op === 'string' ? new Expression(op) : op;
    this.imag.terms = addTerms(this.imag.terms, exp.imag.terms);
    this.imag.constant += exp.imag.constant;
    this.real.terms = addTerms(this.real.terms, exp.real.terms);
    this.real.constant += exp.real.constant;
  }
  return this;
};

Expression.prototype.subtract = function(op) {
  if (typeof op === 'number')
    this.real.constant -= op;
  else if (op instanceof Variable) { // variables can only be real
    let term = new Term(op);
    term.coefficient *= -1;
    this.real.terms.push(term);
  }
  else  {
    let exp = typeof op === 'string' ? new Expression(op) : op;
    this.imag.terms = subtractTerms(this.imag.terms, exp.imag.terms);
    this.imag.constant -= exp.imag.constant;
    this.real.terms = subtractTerms(this.real.terms, exp.real.terms);
    this.real.constant -= exp.real.constant;
  }
  return this;
};

/**
 * Converts Expression object to a list of terms by combining
 * imaginary and real terms. Converts constants into terms and
 * includes in the result.
 * Required for multiply and divide interface functions.
 *
 * @param exp
 * @returns [] list of Term objects
 */
const convertToTerms = (exp) => {
  let terms = [];
  terms = terms.concat(exp.real.terms);
  terms = terms.concat(exp.imag.terms);

  // convert the constants into terms
  let term;
  if (exp.real.constant !== 0 && exp.real.constant !== null) {
    term = new Term();
    term.coefficient = exp.real.constant;
    terms.push(term);
  }

  if (exp.imag.constant !== 0 && exp.imag.constant !== null) {
    term = new Term();
    term.coefficient = exp.imag.constant;
    term.imag = true;
    terms.push(term);
  }

  return terms;
};

Expression.prototype.divide = function(op) {
  let terms_1 = convertToTerms(this); // dividend
  let terms_2 = []; // divisor
  if (typeof op === 'number') {
    let term = new Term();
    term.coefficient = op;
    terms_2.push(term);
  }
  else if (op instanceof Variable) { // variables can only be real
    terms_2.push(new Term(op));
  }
  else  {
    if (typeof op === 'string') {
      op = new Expression(op);
    }
    terms_2 = convertToTerms(op);
  }
  const result = divideTerms(terms_1, terms_2);
  this.termsToExpression(result);
  return this;
};

Expression.prototype.multiply = function(op) {
  let terms_1 = convertToTerms(this); // op1
  let terms_2 = []; // op2
  if (typeof op === 'number') {
    let term = new Term();
    term.coefficient = op;
    terms_2.push(term);
  }
  else if (op instanceof Variable) { // variables can only be real
    terms_2.push(new Term(op));
  }
  else  {
    if (typeof op === 'string') {
      op = new Expression(op);
    }
    terms_2 = convertToTerms(op);
  }
  const result = multiplyTerms(terms_1, terms_2);
  this.termsToExpression(result);
  return this;
};

/**
 * Extracts Expression object fields from a list of terms
 *
 * @param terms
 */
Expression.prototype.termsToExpression = function(terms) {
  this.real.terms = filterOutConstantTerms(terms, false);
  this.real.constant = computeConstant(terms, false);
  this.imag.terms = filterOutConstantTerms(terms, true);
  this.imag.constant = computeConstant(terms, true);
};

/**
 * Given an object of the form {'var_name': <floating_point> }
 * Evaluates the expression by substituting the input variables
 * Returns an Expression object
 *
 * NOTE: only accepts floating point values for substitutions, no complex numbers or variables/expressions
 *
 * @param sub
 * @return Expression or floating point
 */
Expression.prototype.eval = function(sub) {
  let result = new Expression();

  const real = (this.real.terms.reduce((acc, curr) => {return acc.add(curr.eval(sub))}, result)).real.terms;
  const imag = (this.imag.terms.reduce((acc, curr) => {return acc.add(curr.eval(sub))}, result)).imag.terms;

  result.termsToExpression(real.concat(imag));
  result.real.constant += this.real.constant;
  result.imag.constant += this.imag.constant;

  if (!result.real.terms.length && !result.imag.terms.length && (result.imag.constant === 0 || result.imag.constant === null))
    return result.real.constant;
  else
    return result;
};

Expression.prototype.toString = function () {
  let str = "";
  
  for (var i = 0; i < this.imag.terms.length; i++) {
    var term = this.imag.terms[i];
    
    // For the first term to be printed out and is positive, no sign needed
    if (str === "" && Number(term.coefficient).valueOf() > 0) {
      str += term.toString() + "j";
    } else {
      str += (Number(term.coefficient).valueOf() < 0 ? " + (- " + term.toString() + "j)": " + " + term.toString() + "j");
    }
  }

  for (var i = 0; i < this.real.terms.length; i++) {
    var term = this.real.terms[i];

    if (str === "" && Number(term.coefficient).valueOf() > 0) {
      str += term.toString();
    } else {
      str += (Number(term.coefficient).valueOf() < 0 ? " + (- " + term.toString() + ")" : " + " + term.toString());
    }
  }

  // Include the constant at the end 
  if (this.imag.constant !== null) {
    // No variables exist
    if (str === "" && this.imag.constant !== 0) {
      str += this.imag.constant + "j";
      console.log(str);
    } else if (this.imag.constant !== 0) {
      str = str + (this.imag.constant.valueOf() < 0 ? " (- " + this.imag.constant + "j)" : " + " + this.imag.constant + "j");
      console.log(str);
    } 
  } 
  
  if (this.real.constant !== null) {
    // No variables exist
    if (str === "" && this.real.constant !== 0) {
      str += this.real.constant;
    } else if (this.real.constant !== 0) {
      str = str + (this.real.constant.valueOf() < 0 ? " (- " +this.real.constant + ")" : " + " + this.real.constant);
    }
  } 

  return str;
};

/**
 * Equation Constructor
 * Possible Arguments:
 * 1) Single string input - new Equation('x = y + z')
 * 2) 2 Expression objects -> lhs = arg0, rhs - arg1
 *
 * @param arg0
 * @param arg1
 * @constructor
 */
const Equation = function(arg0, arg1) {
  if (arg1 === undefined) {
    if (arg0.indexOf(EQUAL) === -1)
      throw new ArgumentsError('Equation string must include "=" sign!');

    let exp = arg0.split(EQUAL);
    this.lhs = new Expression(exp[0]);
    this.rhs = new Expression(exp[1]);
  }
  else {
    this.lhs = arg0;
    this.rhs = arg1;
  }
};

Equation.prototype.toString = function() {
  return this.lhs.toString() + " = " + this.rhs.toString();
};

const parse = (str) => {
  if (str.indexOf('=') !== -1)
    return new Equation(str);
  else
    return new Expression(str);

};

module.exports = { Expression, Equation, parse };


