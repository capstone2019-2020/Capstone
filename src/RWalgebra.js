const { Variable, Term } = require('./TermVariable.js');
const { TOKEN_TYPES, tokenize } = require ('./token.js');

const ADD = '+';
const SUB = '-';
const MULT = '*';
const DIV = '/';
const POW = '^';
const IMAG_NUM = 'j';
const SUPPORTED_FUNCS = ['sin', 'cos', 'tan', 'log'];
const SUPPORTED_OPS = [ADD, SUB, MULT, DIV, POW];
const SUPPORTED_VAR_CHARS = ['_']; // special chars that are allowed in variable names


const Expression = function (exp_str) {
  this.imag = [];   /* List of Terms */
  this.real = [];   /* List of Terms */
  this.constant = null; /* List of integers/floats */

  if ( typeof exp_str === 'string' ) {
    // Approach:
    // Step 1: Write tokenize function to separate string into tokens
    // Step 2: Write parser function to take tokens and put them into data structure
    const tokens = tokenize(exp_str);
    const parsed_data = this.parse(tokens);
    this.real = parsed_data.real;
    this.constant = parsed_data.constant;
  }
  else if ( typeof exp_str === 'number')
  {
    this.constant = parseFloat(exp_str);
  }
  else {
    throw new ArgumentsError('Invalid argument type for Expression object');
  }
};

const createTermWithVariables = (variables) => {
  let term = new Term(variables[0]);
  let i;
  for (i = 1; i < variables.length; i++) {
    term.variables.push(variables[i]);
  }
  return term;
}

/**
 * String parser that initializes the Expression data structure
 * Only called in the constructor when creating the Expression object
 *
 * @param tokens
 */
Expression.prototype.parse = (tokens) => {
  /**
   * TODO
   * * Need to account for Imaginary Numbers
   * * Add DIV support
   * * Add PARENTHESES support -- hard
   */

  let _constants = [], _real = [];
  let _variables = [], _coeff = 1; // Temporary variables required to create new Term objects
  let _var;

  /* Loop through all remaining tokens and create appropriate data structures */
  tokens.forEach( t => {

    /* Check the type of the operator and set the appropriate flags */
    if (t.type === TOKEN_TYPES.OP) {
      let token_val = t.value;

      if (token_val === SUB || token_val === ADD) {
        // no variables - need to add to constants only
        if (!_variables.length)
          _constants.push(_coeff);

        // term contains variables
        else {
          _var = createTermWithVariables(_variables);
          _var.coefficient = _coeff;
          _real.push(_var);
          _variables = [];
        }

        // reset coefficient
        _coeff = token_val === SUB ? -1 : 1;
        return;
      }
      else if (token_val === MULT) {
        return;
      }
    }

    /* Token = Floating point # */
    if (t.type === TOKEN_TYPES.LITERAL) {
      _var = parseFloat(t.value);
      _coeff = _coeff * _var;
    }

    /* Token = variable  */
    else if (t.type === TOKEN_TYPES.VAR) {
      _variables.push(new Variable(t.value));
    }
  });

  /* Cleanup for the final term */
  if (!_variables.length) {
    _constants.push(_coeff);
  }
  else {
    _var = createTermWithVariables(_variables);
    _var.coefficient = _coeff;
    _real.push(_var);
    _variables = [];
  }

  /* Return constant and list of terms */
  return { constant: _constants.reduce( (acc, curr) => acc + curr, 0), real: _real };
};

module.exports = { Expression };

// Expression.prototype.toString = function () {
//   let retString = "";
//   for (var i = 0; i < this.terms.length; i++) {
//     var tempTerm = this.terms[i];

//     retString += (tempTerm.coefficient[0].valueOf() < 0 ? " - " : " + ") + tempTerm.toString();
//   }
// };


