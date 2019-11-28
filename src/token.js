/**
 * Constants Required for tokenizing expresiion
 */
const IMAG_NUM = 'j';

/* Supported functions, operators, and special characters */
const SUPPORTED_FUNCS = ['sin', 'cos', 'tan', 'log'];
const SUPPORTED_OPS = ['+', '-', '/', '*', '^'];
const SUPPORTED_VAR_CHARS = ['_'] // special chars that are allowed in variable names

/* Token Types */
const TOKEN_TYPES = {
  VAR: 'Variable',
  OP: 'Operator',
  LEFTPAR: 'Left Parenthesis',
  RIGHTPAR: 'Right Parenthesis',
  LITERAL: 'Literal',
  FUNC: 'Function',
  IMAG: 'Imaginary'
};



/**
 * Token Class
 */
const Token = function (_type, _val) {
  this.type = _type;
  this.value = _val;
};

/**
 * Tokenizer - separates the Expression string into an array of tokens
 * Each token has a type (defined above):
 * - Literal: Constant number
 * - Variable
 * - Operator (+ - * / ^)
 * - Imaginary: Constant imaginary number
 * - Left/Right Parenthesis
 *
 * @param exp
 * @returns {Array}
 */
const tokenize = (exp) => {
  let num_buff = '';      // buffer to contain digits
  let char_buff = '';     // buffer to contain characters
  let in_var = false;     // boolean to determine if we are currently tokenizing a variable
  let tokens = [];        // return value

  const chars = exp.split(''); // split into characters
  chars.forEach(ch => {
    if (ch === ' ') // Ignore spaces
      return;

    if (isImag(ch)) {
      num_buff += ch;
    }
    else if (isLetter(ch)){
      char_buff += ch;
      in_var = true;
    }
    else if (isDigit(ch)){
      if (in_var)
        char_buff += ch;
      else{
        num_buff += ch;
      }
    }
    else if (isDecimal(ch)) {
      num_buff += ch;
    }
    else if (isSpecialChar(ch)) {
      if (in_var)
        char_buff += ch;
      else
        throw new SyntaxError('Special characters: "_" are not allowed at the beginning of a variable name');
    }
    else if (isOperator(ch)){
      if (char_buff || num_buff)
        tokens.push(new Token(getTermFromNBOrCB(num_buff, char_buff)));
      tokens.push(new Token(TOKEN_TYPES.OP, ch));

      in_var = false;
      char_buff = '';
      num_buff = '';
    }
    else if (isLeftParenthesis(ch)) {
      if (char_buff) {
        if (isSupportedFunc(char_buff))
          tokens.push(new Token(TOKEN_TYPES.FUNC, char_buff));
        else
          throw new SyntaxError(`${char_buff} is not a supported function!`);
        char_buff = '';
      }
      else if (num_buff) {
        tokens.push(new Token(getTermFromNB(num_buff)));
        num_buff = '';
      }
      tokens.push(new Token(TOKEN_TYPES.LEFTPAR, ch));
      in_var = false;
    }
    else if (isRightParenthesis(ch)) {
      if (char_buff || num_buff)
        tokens.push(new Token(getTermFromNBOrCB(num_buff, char_buff)));
      tokens.push(new Token(TOKEN_TYPES.RIGHTPAR, ch));

      in_var = false;
      char_buff = '';
      num_buff = '';
    } else
      throw new ArgumentsError('Invalid expression string!');
  });

  // add final tokens
  if (char_buff || num_buff){
    tokens.push(getTermFromNBOrCB(num_buff, char_buff));
  }
  return tokens;
};


/**
 * Helper functions to help determine type of token
 * @param ch
 * @returns {boolean}
 */
const isDigit = (ch) => { return /\d/.test(ch); };
const isImag = (ch) => { return ch === IMAG_NUM; };
const isDecimal = (ch) => { return ch === '.'; };
const isLetter = (ch) => { return /[a-zA-z]/i.test(ch); };
const isOperator = (ch) => { return SUPPORTED_OPS.includes(ch); };
const isLeftParenthesis = (ch) => { return ch === '('; };
const isRightParenthesis = (ch) => { return ch === ')'; };
const isSpecialChar = (ch) => { return SUPPORTED_VAR_CHARS.includes(ch); };
const isSupportedFunc = (str) = (str) => { return SUPPORTED_FUNCS.includes(str); };

/**
 * Helper functions to get Literal, Imaginary, and Variable tokens from char_buffer and num_buffers
 * @param num_buff
 * @returns {Token}
 */
const getTermFromNB = (num_buff) => {
  if (num_buff.indexOf(IMAG_NUM) === -1)
    return new Token(TOKEN_TYPES.LITERAL, num_buff);
  else
    return new Token(TOKEN_TYPES.IMAG, num_buff);
};

const getTermFromNBOrCB = (num_buff, char_buff) => {
  if (char_buff) {
    return new Token(TOKEN_TYPES.VAR, char_buff);
  } else if (num_buff) {
    return new Token(getTermFromNB(num_buff));
  }
};

module.exports = { tokenize, TOKEN_TYPES };