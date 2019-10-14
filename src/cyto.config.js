const style = [ // the stylesheet for the graph
  {
    selector: 'node',
    style: {
      'width': 15,
      'height': 15,
      'background-color': '#666',
      'label': 'data(id)'
    }
  },
  {
    selector: 'label',
    style: {
      'font-size': 12
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
