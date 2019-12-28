const { Term } = require('./TermVariable.js');
const tokenizer = require('./token.js');

const IMAG_NUM = 'j';
const SUPPORTED_FUNCS = ['sin', 'cos', 'tan', 'log'];
const SUPPORTED_OPS = ['+', '-', '/', '*', '^'];
const SUPPORTED_VAR_CHARS = ['_'] // special chars that are allowed in variable names


const Expression = function (exp_str) {
  this.imag = [];   /* List of Terms */
  this.real = [];   /* List of Terms */

  if ( typeof exp_str === 'string' ) {
    // Approach:
    // Step 1: Write tokenize function to separate string into tokens
    // Step 2: Write parser function to take tokens and put them into data structure
    const tokens = tokenizer.tokenize(exp_str);
    this.parse(tokens);
  }
  else if ( typeof exp_str === 'number')
  {
    this.terms = [new Term(parseFloat(exp_str))];
  }
  else
    {
    throw new ArgumentsError('Invalid argument type for Expression object');
  }

};

/**
 * String parser that initializes the Expression data structure
 * Only called in the constructor when creating the Expression object
 *
 * @param tokens
 */
Expression.prototype.parse = (tokens) => {

};


function main() {
  const exp = 'x2 - 3*y - (4*z / 12 - 17) + y - 4.5j + (4*x_3 - 2)/(5-12*some_var) + sin(x_3)';
  const tokens = tokenizer.tokenize(exp);
  console.log(JSON.stringify(tokens));
};

module.exports = { Expression };

// Expression.prototype.toString = function () {
//   let retString = "";
//   for (var i = 0; i < this.terms.length; i++) {
//     var tempTerm = this.terms[i];

//     retString += (tempTerm.coefficient[0].valueOf() < 0 ? " - " : " + ") + tempTerm.toString();
//   }
// };

main();
