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
