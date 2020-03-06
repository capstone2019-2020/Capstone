const { Equation, Expression, parse } = require('./RWalgebra.js');
const { Variable } = require('./TermVariable.js');
const { tokenize } = require('./token.js');

function main() {
  const exp = 'x2 - 3*y - (4*z / 12 - 17) + y - 4.5j + (4*x_3 - 2)/(5-12*some_var) + sin(x_3)';
  const simple = 100;
  const no_vars = '5 + 7 * 9 - 10/10 +37 * 0.5';
  const add_test = 'x1 + 5 + 7 + x_7';
  const sub_test = 'x1 + 5 - 7 + x_7 - test + 8.7 - x8';
  const mult_test = 'x1 * x2 + 7.9 * 10 * 2 - x_3 * 7 + 5.91 - x7 + x8 * 9 * 10.7';
  const div_test = 'x1/7 + x2/x3 + 9/7 + 7*x7/x4*8';
  const bracket_test = '(x1 + x2) * (x3 - x4) + 1 / (x1 + x2 * x3) + (x1 + x2) /(x1 + x3)';
  const circuit_test = '(15 - n2) / 12000';
  const imaginary = 'x + x_7j + 5 + 6j + j + (x2 - 10)/(x * j * j)';
  const pow = '((0.002) / (((1.6e-11) / (1.6e-11*w^ 4))*w^ 4))*n2*w*j';
  // const imaginary = '(-x)*j + (2j) + x1 + 5' ;


  // const test_type = process.argv[2];
  // let ex;
  // if (test_type === 'simple')
  //   ex = new Expression(simple);
  // else if (test_type === 'add')
  //   ex = new Expression(add_test);
  // else if (test_type === 'sub')
  //   ex = new Expression(sub_test);
  // else if (test_type === 'mult')
  //   ex = new Expression(mult_test);
  // else if (test_type === 'div')
  //   ex = new Expression(div_test);
  // else if (test_type === 'bracket')
  //   ex = new Expression(bracket_test);
  // else if (test_type === 'no_vars')
  //   ex = new Expression(no_vars);
  // else if (test_type === 'circuit')
  //   ex = new Expression(circuit_test);
  // else if (test_type === 'imag')
  //   ex = new Expression(imaginary);
  //
  // ex.divide('wj + 30');
  // console.log(JSON.stringify(ex));
  // console.log(ex.magnitude());
  // console.log(ex.phase());

  let eq = new Expression('1/');
  console.log('------------------BEFORE-----------------------');
  // console.log(JSON.stringify(eq));
  console.log(JSON.stringify(eq));

  let str = eq.toString();
  let ex = eq.inverse();
  console.log('------------------AFTER-----------------------');
  console.log(ex.toString());
  // console.log(JSON.stringify(ex));


  // let ex = new Expression('24*x2 - 98*x1 - x2');
  // console.log(JSON.stringify(ex));
  // console.log("multiplying...");
  // ex.multiply('69*x1 + 87*x1 - 93*x0');
  // console.log(JSON.stringify(ex));
  // console.log("evaluationg");
  // console.log(ex.eval({x1: 20, x0: 10, x2: 2}));
  // console.log(ex.toString());
  // console.log(ex.eval({x:1}))

  // ex.subtract('x_8j + 9j + (-9) -(8 - (-8)*j)');
  // ex.divide(5);

  // console.log(tokenize(imaginary));
  // console.log('=======================================');
  //   console.log(`Test Equation: ${circuit_test}`);
  //   // console.log('=======================================');
  //   // console.log(`Data Structure: `);
  //   // console.log(JSON.stringify(ex));
  //   // // console.log(ex.real.terms.toString());
  //   // // console.log(ex.imag.terms.toString());
  //   console.log('=======================================');
  //   console.log(`Testing toString():`);
  //   console.log(ex.toString());
  //   console.log('=======================================');
  //
  //   console.log(`Testing .add(x3j):`);
  //   ex.add('x3j');
  //   // console.log(JSON.stringify(ex));
  //   console.log(ex.toString());
  //   console.log('=======================================');
  //
  //   console.log(`Testing .subtract(5*x3j)`);
  //   ex.subtract('5*x3j');
  //   // console.log(JSON.stringify(ex));
  //   console.log(ex.toString());
  //   console.log('=======================================');
  //
  //   console.log(`Testing .multiply(12000)`);
  //   ex.multiply(12000);
  //   // console.log(JSON.stringify(ex));
  //   console.log(ex.toString());
  //   console.log('=======================================');
  //
  //   console.log(`Testing .divide(12000)`);
  //   ex.divide(12000);
  //   // console.log(JSON.stringify(ex));
  //   console.log(ex.toString());
  //
  //   console.log('=======================================');
  //   console.log(`Testing .eval({n2: 0}):`);
  //   let result = ex.eval({'n2' : 0});
  //   // console.log(JSON.stringify(ex));
  //   console.log(result.toString());

  // let x = new Expression('n1');
  // let x2 = new Expression('n2');
  // let sub = x.subtract('n2');
  // console.log(JSON.stringify(sub));
  // let x = new Expression('(x9) + (((((((10) / (x7)) - (x7)) + (80)) - (30)) / (x7)) / (((x0) + (53)) * (x0))) ');
  // let x = new Expression('((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((x043) / (5)) * (30)) * (50)) / (69)) - (33)) * (19)) * (44)) / (x043)) + (x043)) - (x043)) * (x043)) / (x043)) / (39)) + (x043)) / (x043)) * (x043)) * (26)) * (1)) / (x043)) - (x043)) / (x043)) - (94)) - (1)) / (51)) / (x043)) - (48)) - (x043)) - (x043)) - (94)) / (x043)) * (7)) + (37)) + (x043)) - (x043)) / (x043)) - (x043)) / (64)) - (x043)) + (85)) + (x043)) - (x043)) + (x043)) + (52)) + (29)) / (x043)) / (64)) + (50)) / (x043)) + (13)) * (21)) * (37)) / (47)) - (x043)) + (64)) / (83)) - (x043)) * (x043)) * (82)) / (x043)) - (x043)) / (64)) + (x043)) + (x043)) - (17)) - (x043)) * (47)) - (16)) - (52)) - (93)) - (x043)) * (29)) - (x043)) - (x043)) / (x043)) * (55)) * (39)) * (88)) / (x043)) / (x043)) * (46)) / (x043)) * (x043)) * (x043)) * (86)) / (x043)) / (24)) + (x043)) - (x043)) - (47)) + (6)) - (x043)) / (x043)) * (36)) * (x043)) / (23)) - (x043)) - (x043)) * (12)) / (82)) * (35)) + (x043)) + (x043)) / (x043)) * (x043)) + (94)) + (14)) + (x043)) - (32)) / (x043)) / (x043)) - (x043)) * (77)) * (19)) + (((((((((((((((((((((((((((((((((((((((((((((((33) + (x044)) - (x044)) + (x044)) * (x044)) - (7)) / (69)) + (x044)) - (3)) / (24)) * (53)) + (x044)) * (x044)) + (95)) - (x044)) - (x044)) + (38)) - (x044)) + (x044)) - (94)) * (51)) + (29)) + (x044)) * (76)) + (83)) - (x044)) + (x044)) * (28)) / (x044)) * (x044)) + (41)) * (34)) * (97)) - (42)) / (93)) + (59)) + (17)) * (74)) + (29)) / (x044)) - (x044)) + (89)) + (42)) + (x044)) + (x044)) - (x044)) / ((((((((((((((((x004) - (53)) - (x004)) / (3)) + (52)) - (x004)) + (44)) / (x004)) * (5)) - (x004)) - (x004)) + (x004)) - (x004)) * (99)) - (32)) / ((((((((((17) * (x004)) + (65)) * (x004)) * (48)) + (88)) - (x004)) / (x004)) + (40)) * ((x000) - (x000)))))');
  // // x.divide('x1')
  // // console.log(JSON.stringify(x));
  // // console.log('--');
  // console.log(JSON.stringify(x.eval({"x043":95,"x044":91,"x004":61,"x000":64}   )));

};

main();
