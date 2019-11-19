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
