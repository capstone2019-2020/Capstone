// Variable Data structure
var Variable = function (variable) {
  // Type should be a string 
  if (typeof(variable) === "string") {
    if (variable.search('^') != -1) {
      var v = variable.split("^");
      this.degree = v[1];
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
    return "";
  } else if (degree === 1) {
    // Exponent on the variable is 1
    return variable;
  } else {
    return variable + "^" + degree;
  }
};

var Term = function (variable) {
  if (variable instanceof Variable) {
    this.variables = [variable.temp()];
    this.coefficient;
    this.fraction = new Fraction (1, 1);
  } else {
    throw new TypeError("Invalid Argument for Term");
  }
};

// Term.prototype.toString = function () {

// };

var Expression = function (variable) {

  if (typeof(variable) === "string") {
    var v = new Variable(variable);
    var terms = new Term(v);

    // Divide into imaginary and real terms
    // Search for j in the terms
    var tempTerm = terms.toString();
    if (tempTerm.search('j') != -1) {
      this.imaginary = [terms];
    } else {
      this.imaginary = [];
    }
    this.real = [terms];
  } else {
    throw new TypeError ("Invalid Argument for Expression");
  }
};

// Expression.prototype.toString = function () {
//   let retString = "";
//   for (var i = 0; i < this.terms.length; i++) {
//     var tempTerm = this.terms[i];

//     retString += (tempTerm.coefficient[0].valueOf() < 0 ? " - " : " + ") + tempTerm.toString();
//   }
// };

var Equation = function (lhs, rhs) {
  this.lhs = new Expression(lhs);
  this.rhs = new Expression(rhs);
};

Equation.prototype.toString = function () {
  return this.lhs.toString() + " = " + this.rhs.toString();
};

var Fraction = function (n, d) {
  // Error if the denominator is zero
  if (d === 0) {
    throw new EvalError("Dividing by Zero");
  } else {
    this.numer = new Expression(n);
    this.denom = new Expression(d);
  }
};

// In case it needs to be modified 
// Without touching the actual object
Fraction.prototype.temp = function () {
  return new Fraction(this.numer, this.denom);
}

Fraction.prototype.toString = function () {
  var numer = this.numer;
  var denom = this.denom;

  // Numerator is 0 then the fraction itself is 0
  if (numer === 0) {
    return "0";
  } else {
    return numer + "/" + denom;
  }
};
