const {Equation, Expression} = require('../../src/rwalgebrajs/RWalgebra.js');
const {validate} = require('jsonschema');
const LOG_LEVELS = {debug: 4, info: 3, warn: 2, error: 1};
const LOG_LEVEL = LOG_LEVELS[process.env.M1_LOG_LEVEL];
/**
 * Set LOG_LEVEL to true if want verbose logs on tests, else, won't print anything
 */
function log(level, ...params) {
  if (LOG_LEVELS[level] <= LOG_LEVEL) {
    console.log(...params);
  }
}

const debug_log = (...params) => log('debug', ...params);
const info_log = (...params) => log('info', ...params);
const warn_log = (...params) => log('warn', ...params);
const error_log = (...params) => log('error', ...params);

const Schema = function Schema() {
  return {
    Init: (rest) => ({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'srv-doc-processing-schema',
      ...rest,
    }),
    ObjectArray: (properties) => ({
      type: 'array',
      items: {
        type: 'object',
        properties: {...properties},
        additionalProperties: false,
        minProperties: Object.keys(properties).length,
      },
    }),
    StringArray: () => ({
      type: 'array',
      items: {type: 'string'},
    }),
    String: () => ({type: 'string'}),
    NumberString: () => ({type: 'number, string'}),
    StringNull: () => ({type: 'string, null'}),
    Boolean: () => ({type: 'boolean'}),
    PlainObject: () => ({type: 'object'}),
  };
};

exports.gen_eqns_mat = function gen_eqns_mat(n) {
  let M = [];

  for (let row = 0; row < n; row++) {
    let M_row = [];
    for (let col = 0; col < n; col++) {
      // hollow matrix: we want diagonal to be 0s
      // 30% chance that other elems will = 0 (just to add variance)
      if (col === row || Math.random() < 0.3) {
        M_row.push(0);
      } else {
        M_row.push(`a_${row}${col}`);
      }
    }

    if (M_row.length !== n) {
      throw new Error('matrix construction error');
    }
    M.push(M_row);
  }

  return M;
};

exports.printmat = function printmat(M) {
  let pprint_str = '';
  let row_len = M.length, col_len = M[0].length;

  for (let row = 0; row < M.length; row++) {
    let M_row = M[row];
    for (let col = 0; col < M_row.length; col++) {
      if (col+1 !== M_row.length) {
        pprint_str += `${M_row[col]}, `
      } else {
        pprint_str += `${M_row[col]}\n`
      }
    }
  }
  debug_log('Matrix: ' + `${row_len}x${col_len}`);
  debug_log(pprint_str);
};

exports.matmult_to_eqn = function eqns_mat_to_eqns(M) {
  let eqns = [];

  for (let i = 0; i < M.length; i++) {
    let M_row = M[i];
    let lhs = new Expression(`x_${i}`); // x_0, x_1, etc.
    let rhs = new Expression();

    for (let j = 0; j < M_row.length; j++) {
      let expr = new Expression(M_row[j]); // x_0, x_1, etc.
      expr = expr.multiply(`x_${j}`);
      if (Math.random() < 0.5) {
        rhs = rhs.add(expr);
      } else {
        rhs = rhs.subtract(expr);
      }
    }

    eqns.push(new Equation(lhs, rhs));
  }

  return eqns;
};

/**
 * Assumes lhs is x_0, x_1, etc. (isolated) and all rhs is an expression
 *
 * Example: eqn.length = 3
 *    x_0 = 5x_1 + 4x_2
 *    x_1 = x_0
 *    x_2 = x_1
 */
exports.simple_sfg = function get_sfg_mat(eqns) {
  info_log('simple sfg eqns:');
  eqns.forEach(eqn => info_log(eqn.toString()));
  let nodes = {};

  eqns.forEach(eqn => {
    let src_id = eqn.lhs.real.terms.find(() => true).variables[0].toString(); // find first (and hopefully only)

    // create node if not exists
    let src_node = nodes[src_id];
    if (!src_node) {
      src_node = {
        id: src_id,
        outgoingEdges: []
      };
      nodes[src_id] = src_node;
    }

    eqn.rhs.real.terms.forEach(term => {
      let coeff = term.coefficient;
      let variables = term.variables.map(v => v.toString());
      let dest_id = variables[variables.length-1];
      variables = variables.slice(0, variables.length-1);

      let gain = new Expression(1);
      variables.forEach(v => gain = gain.multiply(v));
      gain = gain.multiply(coeff);

      let edge = {
        id: `e_${dest_id}${src_id}`,
        weight: gain.toString(),
        startNode: dest_id,
        endNode: src_id
      };

      let node = nodes[dest_id];
      if (!node) {
        node = {
          id: dest_id,
          outgoingEdges: [edge]
        };
        nodes[dest_id] = node;
      } else {
        node.outgoingEdges.push(edge);
      }
    });
  });

  return Object.values(nodes);
};

/**
 * Things that are checked:
 * (1) Is the schema of the SFG correct?
 * (2) For each node within the SFG:
 *      - Check all outgoing edges have correct weights
 *      - Verify existence of all adjacent nodes
 */
exports.verify_sfg = function verify_sfg(output_sfg, ans_sfg) {
  debug_log('verify sfg: ', JSON.stringify(output_sfg, null, 2));
  let valid = true;

  // (1)
  try {
    let schema = Schema();
    validate(output_sfg, schema.Init(schema.ObjectArray({
      id: schema.String(),
      value: schema.StringNull(),
      outgoingEdges: schema.ObjectArray({
        id: schema.String(),
        weight: schema.NumberString(),
        startNode: schema.String(),
        endNode: schema.String()
      })
    })), {throwError: true});
  } catch (err) {
    if (LOG_LEVEL) {
      info_log('Invalid format for SFG', err);
    }
    return false;
  }

  // (2)
  for (let node of output_sfg) {
    let ans_node = ans_sfg.find(a_n => a_n.id === node.id);
    if (!ans_node) {
      info_log(`could not find node: ${node.id} in solution`);
      valid = false;
      continue;
    }

    let adj = {};
    let edges = node.outgoingEdges;
    let ans_edges = ans_node.outgoingEdges;

    if (edges.length !== ans_edges.length) {
      info_log(`expecting node ${node.id} to have:`,
                  `${ans_edges.length} number of edges`,
                  `got ${edges.length}`);
      valid = false;
    }

    // index by endNode
    edges.forEach(e => adj[e.endNode] = e);
    for (let ans_e of ans_edges) {
      let e = adj[ans_e.endNode];
      if (!e) {
        info_log(`expecting node ${node.id} to be`,
                    `connected to node ${ans_e.endNode}`);
        valid = false;
        continue;
      }

      let regex = /[()]/gm;
      let e_weight = e.weight.toString().replace(regex, '');
      let ans_e_weight = ans_e.weight.toString().replace(regex, '');

      if (e_weight !== ans_e_weight) {
        info_log(`expecting edge ${e.id} to have`,
                    `weight ${ans_e_weight}, got ${e_weight}`);
        valid = false;
      }
    }
  }

  if (!valid) {
    debug_log('expected graph to look like: ',
      JSON.stringify(ans_sfg, null, 2));
  }
  return valid;
};

exports.perf_stats = function perf_stats(highest, lowest, total, iters) {
  return {
    total: Number(total) / 100000,
    highest: Number(highest) / 100000,
    lowest: Number(lowest) / 100000,
    average: Number(total / iters) / 100000
  }
};

/**
 * Samples random inputs for each expression (n / d); only when all iterations
 * are successful is the answer deemed acceptable.
 *
 * Fraction = (n / d)
 * where n = numerator
 *       d = denominator
 */
exports.verify_masons = function verify_masons(output_n,
                                               output_d,
                                               ans_n, ans_d) {
  let valid = true;

  info_log('verify masons:', {
    output: `(${output_n.toString()})/(${output_d.toString()})`, 
    expected: `(${ans_n.toString()})/(${ans_d.toString()})`
  });

  const map_expr_terms = (expr, map, default_val) => {
    expr.real.terms.forEach(term =>
      term.variables.forEach(v => map[v] = default_val)
    );
  };
  const eval = (expr, map) => {
    return parseFloat(expr.eval(map_of_terms).toString())
  };

  let map_of_terms = {};
  map_expr_terms(output_n, map_of_terms, 0);
  map_expr_terms(output_d, map_of_terms, 0);
  map_expr_terms(ans_n, map_of_terms, 0);
  map_expr_terms(ans_d, map_of_terms, 0);

  // for each term in n, d - substitute for random integer
  let output_eval, output_n_eval, output_d_eval;
  let ans_eval,ans_n_eval, ans_d_eval;
  for (let i = 0; i < 100; i++) {
    // perturb terms values - non-zero
    Object.keys(map_of_terms).forEach(term =>
      map_of_terms[term] = Math.ceil(Math.random() * 100)
    );

    info_log('map_of_terms', map_of_terms);
    output_n_eval = eval(output_n, map_of_terms);
    output_d_eval = eval(output_d, map_of_terms);
    ans_n_eval = eval(ans_n, map_of_terms);
    ans_d_eval = eval(ans_d, map_of_terms);

    output_eval = output_n_eval / output_d_eval;
    ans_eval = ans_n_eval / ans_d_eval;

    info_log('output_eval | ans_eval', output_eval, ans_eval);
    if (output_eval !== ans_eval) {
      valid = false;
      break;
    }
  }

  return valid;
};

