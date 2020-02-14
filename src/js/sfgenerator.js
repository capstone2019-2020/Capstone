const DEFAULT_NODE_CLR = 'black';
const SELECTED_NODE_CLR = '#f04b4c';
const GHOST_NODE_CLR = '#528aeb';
const DEFAULT_EDGE_CLR = '#999';

let clickedNodes = null;
let startNode = null;
let endNode = null;
let cy = null;
let svgraph = null;

function initSvgraph() {
  svgraph = init({
    "x_axis": {
      "label": "frequency (Hz)",
      "scale": "log-log",
      "fixed": true,
      "lb": 0,
      "ub": 10,
      "num_grids": 10
    },
    "left_y_axis": {
      "label": "magnitude (dB)",
      "scale": "linear",
      "fixed": true,
      "lb": -60,
      "ub": 30,
      "num_grids": 9
    },
    "right_y_axis": {
      "label": "phase (degrees)",
      "scale": "linear",
      "fixed": true,
      "lb": -90,
      "ub": 0,
      "num_grids": 9
    }
  });
}

/**
 * Function to convert our custom SFG data structure
 * into the Cytoscape data structure
 *
 * @param sfg
 * @returns {{nodes: Array, edges: Array}}
 */
function sfgToCyto(sfg) {
  if (!sfg) {
    return;
  }

  const nodes = [], edges = [];
  sfg.forEach(n => {
    let _id = n.value !== null ? n.value.toString() : n.id;
    console.log(_id);
    nodes.push({
      data: {id: n.id, value: _id.substring(0, 7)},
      classes: ['unselected-node']
    });

    n.outgoingEdges.forEach(e => {
      edges.push({
        data: {
          id: e.id,
          edgeWeight: e.weight.substring(0, 7),
          source: e.startNode,
          target: e.endNode
        }
      });
    });
  });
  return {nodes, edges};
}

function resetEdgeColors() {
  cy.edges().forEach(e => {
    e.style('line-color', DEFAULT_EDGE_CLR);
    e.style('target-arrow-color', DEFAULT_EDGE_CLR);
  });
  cy.nodes().forEach( n => {
    if (!clickedNodes.includes(n.data().id)) {
      n.style('background-color', DEFAULT_NODE_CLR);
    }
  })
}

/**
 * Highlight forward paths from node
 *
 * @param node
 */
function highlightForwardPaths(node) {
  // reset all edges
  resetEdgeColors();

  var edges = node.successors();
  edges.forEach( e => {
    e.style('background-color', GHOST_NODE_CLR);
    e.style('line-color', GHOST_NODE_CLR);
    e.style('target-arrow-color', GHOST_NODE_CLR);
  });
}

/**
 * On page load, generate the Cytoscape SFG
 * Assumes that the 'sfg_nodes' localStorage variable
 * was previously set when the user first uploaded the
 * netlist file from the buttonindex.html page
 */
function generateSFG() {
  const sfg = localStorage.getItem('sfg_nodes');
  console.log(sfg);
  const elements = sfgToCyto(JSON.parse(sfg));
  cy = cytoscape({
    container: document.getElementById('sfg-canvas'), // container to render in
    elements,
    style: cyto.style,
    layout: {name: 'cose-bilkent'},
    selectionType: cyto.selectionType
  });
  clickedNodes = [];

  /* Set click handler for nodes - required for start/end node selection */
  cy.nodes().on('click', function(e){
    let clickedNode = e.target;

    let _idx = clickedNode.data().id;
    console.log(`idx: ${_idx}`);
    /* Case 1: node was previously selected - deselect */
    if (clickedNodes.includes(_idx)) {
      resetEdgeColors();
      clickedNode.style('background-color', DEFAULT_NODE_CLR);

      let i = clickedNodes.indexOf(_idx);
      if (i === 0) {
        startNode = endNode;
      }
      endNode = null;
      clickedNodes.splice(i, 1);

      highlightForwardPaths(cy.getElementById(startNode));
      document.getElementById('simulate-button').style.display = 'none';
      document.getElementById('sfg-help-text').style.display = 'inline-block';

    }
    /* Case 2: node was not clicked yet and only one element selected */
    else if (clickedNodes.length === 0) {
      clickedNode.style('background-color', SELECTED_NODE_CLR);
      clickedNodes.push(_idx);
      startNode = _idx;

      // highlight all forward paths
      highlightForwardPaths(clickedNode);
    }
    else if (clickedNodes.length === 1) {
      clickedNode.style('background-color', SELECTED_NODE_CLR);
      clickedNodes.push(_idx);
      endNode = _idx;

      resetEdgeColors();
      document.getElementById('simulate-button').style.display = 'inline-block';
      document.getElementById('sfg-help-text').style.display = 'none';
    }
    console.log(clickedNodes);
  });

}

/**
 * Function to generate transfer function
 */
function simulate() {
  fetch(`${SERVER_URI}/computeMasons`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({start: startNode, end: endNode})
  })
    .then((res) => {
      return res.json();
    })
    .then((j) => {
      setLocalStorage('transfer_func', JSON.stringify(j));

      let mag = math.simplify(j.bode.magnitude).toString();
      let phase = math.simplify(j.bode.phase).toString();

      svgraph.update([`f(w) = ${mag}`], [`f(w) = ${phase}`]);
    });

}

/**
 * Fit SFG to SFG canvas in left panel
 */
function sfgFit() {
  cy.fit();
}

/**
 * Function to export SFG as either a PNG or JPG image
 * Upon calling this function, the user will be prompted
 * to save the image.
 * Input parameter must be a string:
 *    "png" OR "jpg"
 *
 * @param _type
 */
function exportSFG(_type) {
  const options = { output: 'blob', bg: 'white'};
  let img, type;
  if (_type === 'png') {
    img = cy.png(options);
    type = `image/png`;
  }
  else if (_type === 'jpg') {
    img = cy.jpg(options);
    type = `image/jpeg`;
  }

  const filename = `sfg.${_type}`;
  let a = document.getElementById("downloadsfg");
  let file = new Blob([img], { type: type });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
}

