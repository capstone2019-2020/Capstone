const suite = require('./suite');
const m1 = require('../src/m1');

let M = suite.gen_eqns_mat(3);
suite.printmat(M);
let eqns = suite.matmult_to_eqn(M);
eqns.forEach(eqn => {
  console.log(eqn.toString());
});

let ans_sfg = suite.simple_sfg(eqns);
let sfg = m1.computeSFG(eqns);
console.log(JSON.stringify(ans_sfg));
console.log(JSON.stringify(sfg));
console.log(suite.verify_sfg(sfg, ans_sfg));
