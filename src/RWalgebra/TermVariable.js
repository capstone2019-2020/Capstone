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

Variable.prototype.copy = function () {
  let copy = new Variable(this.name);
  copy.degree = this.degree;
  return copy;
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
    this.variables = [new Variable(variable)];
    this.coefficient = 1;
    this.fraction = new Fraction(1, 1);
    this.imag = false;
  }
  else if (variable === undefined) {
    this.variables = [];
    this.coefficient = 1;
    this.fraction = new Fraction(1, 1);
    this.imag = false;
  }
  else {
    throw new TypeError("Invalid Argument for Term");
  }

};

Term.prototype.eval = function(sub) {
  let copy = this.copy();
  const vars = Object.keys(sub);
  copy.variables.forEach((v, i) => {
    if (vars.includes(v.name)) {
      if (typeof sub[v.name] !== 'number')
        throw new ArgumentsError('ERROR: eval() only accepts floating point numbers!');
      copy.coefficient *= Math.pow(sub[v.name], v.degree);
    }
  });

  copy.variables = copy.variables.filter(v => !vars.includes(v.name));

  // evaluate fraction
  if (typeof copy.fraction.denom !== 'number'){
    let denom = copy.fraction.denom.eval(sub);

    if (typeof denom === 'number') {
      if (denom === 0)
        throw new Error('ERROR: Dividing by ZERO');
      copy.coefficient = copy.coefficient / denom;
      copy.fraction = new Fraction(1, 1);
    } else
      copy.fraction.denom = denom;
  }

  return copy;
};

Term.prototype.copy = function() {
  let term = new Term();
  term.coefficient = this.coefficient;
  term.variables = this.variables.map(v => v.copy());
  term.fraction = this.fraction.copy();
  term.imag = this.imag;
  return term;
};

Term.prototype.toString = function () {
  var str = "";

  // Coefficient is not 1
  if (math.abs(Number(this.coefficient)) !== 1 && math.abs(Number(this.coefficient)) !== 0) {
    // str += math.abs(this.coefficient).toString();
    str += (Number(this.coefficient).valueOf() < 0 ? "(" + this.coefficient.toString() + ")" : this.coefficient.toString());
  } 

  // There exists a fraction in the term
  if (math.abs(Number(this.fraction.numer)) !== 1 || math.abs(Number(this.fraction.denom)) !== 1) {
    // The numerator is one which can be replaced with the coefficient number
    if (math.abs(Number(this.fraction.numer)) === 1 && math.abs(Number(this.coefficient)) !== 1) {
      str = "((" + str + ") / (" + this.fraction.denom.toString() + "))";  
    } else {
      str += "((" + this.fraction.numer.toString() + ") / (" + this.fraction.denom.toString() + "))";
    }
  }

  // From algebra.js
  str = this.variables.reduce(function (p, c) {
      if (!!p) {
          var vStr = c.toString();
          return !!vStr ? p + "*" + vStr : p;
      } else
          return p.concat(c.toString());
  }, str);
  str = (str.substring(0, 3) === " * " ? str.substring(3, str.length) : str);
  // str = (str.substring(0, 1) === "-" ? str.substring(1, str.length) : str);

  if (Number(this.coefficient) === -1 && str !== "") {
    str = "(-" + str + ")";
  } else if (str === "" && Number(this.coefficient) === -1) {
    str = this.coefficient;
  }

  return str;
};

module.exports = {
  Variable: Variable, 
  Term: Term
};
