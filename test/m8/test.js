const nl = require('../../src/nodeJS/netlist.js');
const {Expression, Equation} = require('../../src/RWalgebra/RWalgebra.js');

const netlist = [
  'V1 1 0 24',
  'R1 1 0 10',
  'R2 1 2 4',
  'C1 2 0 0.002'
];
const parsedNetlist = nl.nlConsumeArr(netlist);
console.log(parsedNetlist);

/*
[
  { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: 24 },
  { id: 'R1', type: 'R', pnode: 1, nnode: 0, value: 10 },
  { id: 'R2', type: 'R', pnode: 1, nnode: 2, value: 4 },
  { id: 'C1', type: 'C', pnode: 2, nnode: 0, value: 0.002 }
]
 */

const DEFINED = (v) => (typeof v !== 'undefined') && (v !== null);

/**
 * Returns expression
 *
 * @param node
 * @returns {null|*}
 */
function component_get_admittance(node) {
  let exprStr;
  switch(node.type) {
    case 'R':
      // exprStr = node.value.toString();
      exprStr = `1/${node.id}`;
      break;
    case 'C':
      // exprStr = `1/(j*w*${node.value}`;
      exprStr = `j*w*${node.id}`;
      break;
    default:
      return null;
  }

  return new Expression(exprStr);
}

function get_adj_node_id(node, edge) {
  return edge.pnode === node.id
    ? edge.nnode
    : edge.pnode;
}

function get_v_n(nodes, node_n) {
  // Special case: Node 0 is always ground
  if (node_n.id === 0) {
    console.log('ground node', node_n.id);
    return {
      Isc: null,
      V: new Expression(0)
    };
  }

  // driving-point admittance
  let y_n = new Expression();

  // short circuit current
  let isc_n = new Expression();

  let edge_i, node_i, y_i, isc_i;
  let i;
  for (i=0; i<node_n.adj.length; i++) {
    edge_i = node_n.adj[i];
    node_i = nodes[get_adj_node_id(node_n, edge_i)];

    // Special case: connected to voltage source
    if (edge_i.type === 'V') {
      return {
        Isc: null,
        V: new Expression(edge_i.value)
      };
    }

    y_i = component_get_admittance(edge_i);
    if (DEFINED(y_i)) {
      y_n.add(y_i);

      isc_i = new Expression(`V${node_i.id}`);
      isc_i.multiply(y_i);
      isc_n.add(isc_i);
    }

    if (edge_i.type === 'I') {
      isc_n.add(edge_i.value);
    }
  }

  /*
   * Formula: V_n = Z_dpi_n * I_sc_n
   *
   * Since we have the driving-point admittance, to
   * calculate driving-point impedance, the inverse
   * must be taken:
   *
   * Z_dpi_n = 1 / Y_dpi_n
   */
  let dpi_n = y_n.inverse();
  return {
    Isc: isc_n,
    V: new Expression(`5*I${node_n.id}`),
    // V: dpi_n.multiply(`Isc_n${node_n.id}`)
  };
}

function dpi(components) {
  /*
   * Build a nodes data structure according to components
   * in the circuit.
   *
   * Key: Components are actually edges.
   *
   * Nodes: {
   *    id: NUMBER,
   *    adj: []
   * }
   */
  let nodes = [];
  {
    let comp, node;
    let i;
    for (i=0; i<components.length; i++) {
      comp = components[i];

      node = nodes.find(n => n.id===comp.pnode);
      if (!DEFINED(node)) {
        nodes.push({
          id: comp.pnode,
          adj: [comp]
        });
      } else {
        node.adj.push(comp);
      }

      node = nodes.find(n => n.id===comp.nnode);
      if (!DEFINED(node)) {
        nodes.push({
          id: comp.nnode,
          adj: [comp]
        });
      } else {
        node.adj.push(comp);
      }
    }
  }

  let equations = [];
  {
    const add_equation = (lhs_str, expr) => {
      if (DEFINED(expr)) {
        lhs = new Expression(lhs_str);
        rhs = expr;
        equation = new Equation(lhs, rhs);
        equations.push({
          str: equation.toString(),
          obj: equation
        });
      }
    };

    let node_i, lhs, rhs, equation;
    let i;
    for (i=0; i<nodes.length; i++) {
      node_i = nodes[i];

      let {Isc, V} = get_v_n(nodes, node_i);
      add_equation(`I${node_i.id}`, Isc);
      add_equation(`V${node_i.id}`, V);
    }
  }

  return equations;
}

console.log(dpi(parsedNetlist));
module.exports.dpi = dpi;
