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
