const { Expression } = require('../RWalgebra.js');

function main() {
  const exp = 'x2 - 3*y - (4*z / 12 - 17) + y - 4.5j + (4*x_3 - 2)/(5-12*some_var) + sin(x_3)';
  const simple = 'x3';
  const add_test = 'x1 + 5 + 7 + x_7';
  const sub_test = 'x1 + 5 - 7 + x_7 - test + 8.7 - x8';
  const mult_test = 'x1 * x2 + 7.9 * 10 * 2 - x_3 * 7 + 5.91 - x7 + x8 * 9 * 10.7';
  const div_test = 'x1/7 + x2/x3 + 9/7 + 7*x7/x4';

  const test_type = process.argv[2];
  console.log(test_type);
  let ex;
  if (test_type === 'simple')
    ex = new Expression(simple);
  else if (test_type === 'add')
    ex = new Expression(add_test);
  else if (test_type === 'sub')
    ex = new Expression(sub_test);
  else if (test_type === 'mult')
    ex = new Expression(mult_test);
  else if (test_type === 'div')
    ex = new Expression(div_test);

  console.log(JSON.stringify(ex));
};

main();