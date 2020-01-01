const { Fraction } = require('./Fraction.js');
const math = require('mathjs');

// Variable Data structure
var Variable = function (variable) {
  // Type should be a string 
  if (typeof(variable) === "string") {
    if (variable.search(/\^/) != -1) {
      var v = variable.split("^");
      this.degree = Number(v[1]);
      this.name = v[0];
    } else {
      this.degree = 1;
      this.name = variable;
    }
  } else {
    throw new TypeError("Invalid Argument of Variable Initialization");
  }
};

Variable.prototype.temp = function () {
  return new Variable(this.variable);
};

// Converting the variable to string function 
Variable.prototype.toString = function () {
  var degree = this.degree;
  var variable = this.name;

  // Exponent is 0 for the variable then return nothing
  if (degree === 0) {
    return "1";
  } else if (degree === 1) {
    // Exponent on the variable is 1
    return variable;
  } else {
    return variable + "^ " + degree;
  }
};

var Term = function (variable) {
  if (variable instanceof Variable) {
    this.variables = [variable];
    this.coefficient = 1;
    this.fraction = new Fraction (1, 1);
    this.imag = false;
  }
  else if (typeof(variable) === "string") {
    this.variables = [];
    this.coefficient = 1;
    this.fraction = new Fraction(1, 1);
    this.imag = false;
  } else {
    throw new TypeError("Invalid Argument for Term");
  }
  this.coefficient
};

Term.prototype.toString = function () {
  var str = "";

  if (Number(this.coefficient) != 1) {
    str = this.coefficient + "*" + str;
  }

  if (math.abs(Number(this.fraction.numer)) != 1 || math.abs(Number(this.fraction.denom)) != 1) {
    str += this.fraction.numer.toString() + " / " + this.fraction.denom.toString();
  }

  str = this.variables.reduce(function (p, c) {
      if (!!p) {
          var vStr = c.toString();
          return !!vStr ? p + "*" + vStr : p;
      } else
          return p.concat(c.toString());
  }, str);
  str = (str.substring(0, 3) === " * " ? str.substring(3, str.length) : str);
  str = (str.substring(0, 1) === "-" ? str.substring(1, str.length) : str);

  return str;
};

// (function main() {
//   var testVariable = [
//       'x1',
//       'x2 ^ 2'
//   ];
//
//   var testTerms = [
//     new Term(testVariable[0]),
//     new Term('4*x5')
// ];
//
//   testVariable.forEach((test) => {
//     var v = new Variable(test);
//     console.log(v);
//     console.log(v.toString());
//   }
//   )
//
//   testTerms.forEach((test2) => {
//     console.log(test2);
//     console.log(test2.toString());
//   })
// })();

module.exports = {
  Variable: Variable, 
  Term: Term
};