const fs = require('fs');
const {toNetlist, fromAsc} = require('./spice_asc');

/*
 * Input: file path containing netlist,
 * @return <Components>
 */
exports.nlConsume = filepath => {
  const d = fs.readFileSync(filepath, {encoding: 'utf8'});
  return toNetlist(d.split('\n'));
};

exports.ascConsume = filepath => {
  const d = fs.readFileSync(filepath, {encoding: 'utf8'});
  const asc = fromAsc(d);
  console.log(JSON.stringify(asc));
  return asc;
};

/*
 * Input: array of components in a netlist,
 * @return <Components>
 */
exports.nlConsumeArr = netlistArr => toNetlist(netlistArr);
