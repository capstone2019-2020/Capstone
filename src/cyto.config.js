const style = [ // the stylesheet for the graph
  {
    selector: 'node',
    style: {
      'width': 15,
      'height': 15,
      'background-color': '#666',
      'label': 'data(value)'
    }
  },
  {
    selector: 'label',
    style: {
      'font-size': 10,
      'font-family': 'Verdana, sans-serif'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'curve-style': 'bezier',
      'control-point-distance': '50px',
      'control-point-weight': '0.7', // '0': curve towards source node, '1': towards target node.
      'edge-distances': 'intersection',
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      'target-arrow-shape': 'triangle',
      'label': 'data(edgeWeight)'
    }
  }
];

const layout = {
  name: 'grid',
    rows: 3
};

const cyto = { style, layout };
