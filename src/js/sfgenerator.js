const DEFAULT_NODE_CLR = 'black';
const SELECTED_NODE_CLR = '#f04b4c';
const GHOST_NODE_CLR = '#528aeb';
const DEFAULT_EDGE_CLR = '#999';
const DEFAULT_FONT_CLR = 'black';

const CIRCUIT_CANVAS_ID = 'circuit-canvas';

let clickedNodes = null;
let startNode = null;
let endNode = null;
let cy = null;
let svgraph = null;
let loopgraph = null;

function initSvgCircuit() {
  let ltspice = JSON.parse(getCookie('ltspice'));
  let _sfg = JSON.parse(getCookie('sfg_nodes'));

  let rect = document.getElementById(CIRCUIT_CANVAS_ID).getBoundingClientRect();
  let {asc, nodes} = fromAsc(ltspice, {x: rect.width, y: rect.height});
  setLocalStorage('circuit_asc', JSON.stringify(asc));
  generateCircuit(CIRCUIT_CANVAS_ID, asc);
  sfg_init(toSFG(nodes, _sfg));
}

function onToggleSvgCircuit(ele) {
  let isHide = ele.checked;
  let asc = JSON.parse(getCookie('circuit_asc'));

  if (isHide) {
    removeSFG();
    putCircuitToForeground('circuit-canvas', asc);
  } else {
    let ltspice = JSON.parse(getCookie('ltspice'));
    let _sfg = JSON.parse(getCookie('sfg_nodes'));

    let rect = document.getElementById(CIRCUIT_CANVAS_ID).getBoundingClientRect();
    let {nodes} = fromAsc(ltspice, {x: rect.width, y: rect.height});
    generateCircuit('circuit-canvas', asc);
    sfg_init(toSFG(nodes, _sfg));
  }
}

function initSvgraph() {
  console.log('initSVGraph');
  let svgraph_initializer = new SVGraph_initializer('svg-graph');
  let loopgraph_initializer = new SVGraph_initializer('loop-graph');
  svgraph_initializer.onXChange(xval => onSvgraphXChange('w', xval));
  loopgraph_initializer.onXChange(xval => onSvgraphXChange('w', xval));

  loopgraph = loopgraph_initializer.init({
    "x_axis": {
      "label": "frequency (rad/s)",
      "scale": "log-log",
      "fixed": true,
      "lb": 0,
      "ub": 10,
      "num_grids": 10
    },
    "left_y_axis": {
      "label": "loop gain - magnitude (dB)",
      "scale": "linear",
      "fixed": true,
      "lb": -60,
      "ub": 30,
      "num_grids": 9
    },
    "right_y_axis": {
      "label": "loop gain - phase (deg)",
      "scale": "linear",
      "fixed": true,
      "lb": -90,
      "ub": 0,
      "num_grids": 9
    }
  });

  svgraph = svgraph_initializer.init({
    "x_axis": {
      "label": "frequency (rad/s)",
      "scale": "log-log",
      "fixed": true,
      "max": 7,
      "lb": 3,
      "ub": 7,
      "num_grids": 10
    },
    "left_y_axis": {
      "label": "transfer function - magnitude (dB)",
      "scale": "linear",
      "fixed": true,
      "lb": -10,
      "ub": 10,
      "num_grids": 9
    },
    "right_y_axis": {
      "label": "transfer function - phase (deg)",
      "scale": "linear",
      "fixed": true,
      "lb": -90,
      "ub": 0,
      "num_grids": 9 }
  });
}

function onSvgraphXChange(varName, replaceWith) {
  const {Expression} = rwalgebra;
  const replace = (eles, eqnName, dataNames) => {
    let json, expr, evaluated;
    eles.forEach(ele => {
      json = ele.json().data;
      let d = json[eqnName];
      let str = d;
      try {
        if (d.includes(varName)) {
          expr = new Expression(d);
          evaluated = expr.eval({[varName]: replaceWith});
          if (expr.isComplex()) {
            str = evaluated.toPolar();
          } else {
            str = evaluated.toString();
          }
        } else {
          return;
        }
      } catch (err) {
        console.error(err);
        return;
      }

      dataNames.forEach(id =>
        ele.data({[id]: str}));
    });
  };

  replace(cy.nodes(), 'eqn', ['value']);
  replace(cy.edges(), 'eqn', ['edgeWeight', 'name']);
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
  console.log(JSON.stringify(sfg));
  sfg.forEach(n => {
    let _id = n.value !== null ? n.id + '=' + n.value.toString() : n.id;
    let _value = _id.substring(0, 10);
    nodes.push({
      data: {
        id: n.id,
        value: _value,
        eqn: _value
      },
      classes: ['unselected-node']
    });

    n.outgoingEdges.forEach(e => {
      let _value = e.weight;//.substring(0, 10);
      edges.push({
        data: {
          id: e.id,
          edgeWeight: `${_value}`,
          name: `${_value.substring(0, 10)} ${_value.length > 10 ? '>>>' : ''}`,
          eqn: _value,
          source: e.startNode,
          target: e.endNode
        }
      });
      console.log(_value.substring(0, 10));

    });
  });
  return {nodes, edges};
}

function resetEdgeColors() {
  cy.edges().forEach(e => {
    e.style('line-color', DEFAULT_EDGE_CLR);
    e.style('target-arrow-color', DEFAULT_EDGE_CLR);
    e.style('color', DEFAULT_FONT_CLR);
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
 * Hightlight forward paths from start and end node
 */
function highlightStartEndPath() {
  const start = cy.getElementById(startNode);
  const end = cy.getElementById(endNode);
  let p = cy.elements().aStar({ root: start, goal: end, directed: true}).path;
  if (p) {
    p.forEach( ele => {
      ele.style('background-color', SELECTED_NODE_CLR);
      ele.style('line-color', SELECTED_NODE_CLR);
      ele.style('target-arrow-color', SELECTED_NODE_CLR);
    })
  }
}

/**
 * On page load, generate the Cytoscape SFG
 * Assumes that the 'sfg_nodes' localStorage variable
 * was previously set when the user first uploaded the
 * netlist file from the buttonindex.html page
 */
async function generateSFG() {
  const sfg = localStorage.getItem('sfg_nodes');
  const gain = localStorage.getItem('loop_gain');

  console.log(sfg);
  console.log(localStorage.getItem('loop_gain'));
  const elements = sfgToCyto(JSON.parse(sfg));
  const loopElements = JSON.parse(gain);
  
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
      highlightStartEndPath();
      simulate();
    }
    console.log(clickedNodes);
  });

  cy.edges().on('click', function(e) {
    let clicked_edge = e.target;
    const weight = clicked_edge.data().edgeWeight;
    resetEdgeColors();

    let weightText;
    try{
      weightText = math.simplify(weight);
    } catch (err) {
      weightText = weight;
    }
    document.getElementById('edge-weight').innerText = `Weight: ${weightText}`;
    clicked_edge.style('color', 'tomato');
  });
  // console.log(loopgraph);
  loopgraph.put([`f(w) = ${loopElements.magnitude}`], [`f(w) = ${loopElements.phase}`]);
}

/**
 * Function to generate transfer function
 */
async function simulate() {
  await fetch(`${SERVER_URI}/computeMasons`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      nodes: getCookie('sfg_nodes'),
      start: startNode,
      end: endNode
    })
  })
    .then((res) => {
      return res.json();
    })
    .then((j) => {
      setLocalStorage('transfer_func', JSON.stringify(j));

      let mag = j.bode.magnitude;
      let phase = j.bode.phase;

      svgraph.put([`f(w) = ${mag}`], [`f(w) = ${phase}`]);
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

