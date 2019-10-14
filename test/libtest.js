const suite = require('./suite');
const m1 = require('../src/m1');
const {equations} = require('./tests');
const algebra = require('algebra.js');

// let alg_eqns = eqns.map(eq_obj => {
//   let eqns = eq_obj.eqns.map(e => {
//     return algebra.parse(e);
//   });
//   let parsed_n = algebra.parse(eq_obj.n);
//   let parsed_d = algebra.parse(eq_obj.d);
//   console.log(parsed_n, parsed_d);
//   console.log(suite.verify_masons(parsed_n, parsed_d, parsed_n, parsed_d));
//   return eqns;
// });
let eqns = suite.matmult_to_eqn(suite.gen_eqns_mat(6));
eqns.forEach(eqn => console.log(eqn.toString()));
const sfg = suite.simple_sfg(eqns);
console.log(JSON.stringify(sfg));

// alg_eqns.forEach(eqns => {
//   let ans_sfg = suite.simple_sfg(eqns);
//   let sfg = m1.computeSFG(eqns);
//   console.log(JSON.stringify(ans_sfg));
//   // console.log(JSON.stringify(sfg));
//   // console.log(suite.verify_sfg(sfg, ans_sfg));
// });
