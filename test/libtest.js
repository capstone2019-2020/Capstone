const suite = require('./suite');
const m1 = require('../src/m1');
const {equations} = require('./tests');
const algebra = require('algebra.js');

let alg_eqns = equations.map(eq_obj => {
  let eqns = eq_obj.equations.map(e => {
    return algebra.parse(e);
  });
  let parsed_n = algebra.parse(eq_obj.n);
  let parsed_d = algebra.parse(eq_obj.d);
  console.log(parsed_n, parsed_d);
  console.log(suite.verify_masons(parsed_n, parsed_d, parsed_n, parsed_d));
  return eqns;
});
alg_eqns.forEach(eqns => {
  let ans_sfg = suite.simple_sfg(eqns);
  let sfg = m1.computeSFG(eqns);
  console.log(JSON.stringify(ans_sfg));
  // console.log(JSON.stringify(sfg));
  // console.log(suite.verify_sfg(sfg, ans_sfg));
});
