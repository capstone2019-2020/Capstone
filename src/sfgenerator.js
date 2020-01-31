const DEFAULT_NODE_CLR = '#666';
const SELECTED_NODE_CLR = 'tomato';

let clickedNodes = null;
let startNode = null;
let endNode = null;

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

/**
 * On page load, generate the Cytoscape SFG
 * Assumes that the 'sfg_nodes' localStorage variable
 * was previously set when the user firs uploaded the
 * netlist file from the buttonindex.html page
 */
function generateSFG() {
  const sfg = localStorage.getItem('sfg_nodes');
  console.log(sfg);
  const elements = sfgToCyto(JSON.parse(sfg));
  let cy = cytoscape({
    container: document.getElementById('sfg-canvas'), // container to render in
    elements,
    style: cyto.style,
    layout: cyto.layout,
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
      clickedNode.style('background-color', DEFAULT_NODE_CLR);

      let i = clickedNodes.indexOf(_idx);
      if (i === 0) {
        startNode = endNode;
      }
      endNode = null;
      clickedNodes.splice(i, 1);
      document.getElementById('simulate-button').style.display = 'none';

    }
    /* Case 2: node was not clicked yet and only one element selected */
    else if (clickedNodes.length === 0) {
      clickedNode.style('background-color', SELECTED_NODE_CLR);
      clickedNodes.push(_idx);
      startNode = _idx;
    }
    else if (clickedNodes.length === 1) {
      clickedNode.style('background-color', SELECTED_NODE_CLR);
      clickedNodes.push(_idx);
      endNode = _idx;
      console.log('setting display = block')
      document.getElementById('simulate-button').style.display = 'inline-block';
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
      console.log(j);
    });

}