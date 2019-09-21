const {Equation, Expression} = require('algebra.js');
const {validate} = require('jsonschema');
const DEBUG = true;

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
    Boolean: () => ({type: 'boolean'}),
    PlainObject: () => ({type: 'object'}),
  };
};

function debug_log(...params) {
  if (DEBUG) {
    console.log(...params);
  }
}

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
  let nodes = {};

  eqns.forEach(eqn => {
    let src_id = eqn.lhs.terms.find(() => true).variables[0].toString(); // find first (and hopefully only)

    // create node if not exists
    let src_node = nodes[src_id];
    if (!src_node) {
      src_node = {
        id: src_id,
        outgoingEdges: []
      };
      nodes[src_id] = src_node;
    }

    eqn.rhs.terms.forEach(term => {
      let coeff = term.coefficient();
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
  let valid = true;
  // (1)
  try {
    let schema = Schema();
    validate(output_sfg, schema.Init(schema.ObjectArray({
      id: schema.String(),
      outgoingEdges: schema.ObjectArray({
        id: schema.String(),
        weight: schema.String(),
        startNode: schema.String(),
        endNode: schema.String()
      })
    })), {throwError: true});
  } catch (err) {
    if (DEBUG) {
      debug_log('Invalid format for SFG', err);
    }
    return false;
  }

  // (2)
  output_sfg.forEach(node => {
    let ans_node = ans_sfg.find(a_n => a_n.id === node.id);
    if (!ans_node) {
      debug_log(`could not find node: ${node.id} in solution`);
      valid = false;
    }

    let adj = {};
    let edges = node.outgoingEdges;
    let ans_edges = ans_node.outgoingEdges;

    if (edges.length !== ans_edges.length) {
      debug_log(`expecting node ${node.id} to have\
                  ${ans_edges.length} number of edges,\
                  got ${edges.length}`);
      valid = false;
    }

    // index by endNode
    edges.forEach(e => adj[e.endNode] = e);
    ans_edges.forEach(ans_e => {
      let e = adj[ans_e.endNode];
      if (!e) {
        debug_log(`expecting node ${node.id} to be\
                    connected to node ${ans_e.endNode}`);
        valid = false;
        return;
      }

      let e_weight = e.weight.toString();
      let ans_e_weight = ans_e.weight.toString();

      if (e_weight !== ans_e_weight) {
        debug_log(`expecting edge ${e.id} to have\
                    weight ${ans_e_weight}, got ${e_weight}`);
        valid = false;
      }
    })
  });

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
