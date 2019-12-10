var Equation = function (lhs, rhs) {
  this.lhs = new Expression(lhs);
  this.rhs = new Expression(rhs);
};

Equation.prototype.toString = function () {
  return this.lhs.toString() + " = " + this.rhs.toString();
};
