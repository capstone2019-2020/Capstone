const style = [ // the stylesheet for the graph
  {
    selector: 'node',
    style: {
      'width': 10,
      'height': 10,
      'background-color': 'black',
      'label': 'data(value)',
      'text-justification': 'auto',
      'overlay-opacity': 0,
      'text-background-color': 'white'
    }
  },
  {
    selector: 'label',
    style: {
      'font-size': 8,
      'font-family': 'Calibri, sans-serif',
      'text-background-color': 'white',
      'text-background-opacity': 1
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 0.5,
      'curve-style': 'unbundled-bezier',
      'control-point-distance': '10px -10px -10px',
      'control-point-weight': '0.1', // '0': curve towards source node, '1': towards target node.
      'edge-distances': 'intersection',
      'line-color': '#999',
      'target-arrow-color': '#999',
      'target-arrow-shape': 'vee',
      'arrow-scale': 0.5,
      'label': 'data(edgeWeight)',
      'font-size': 6,
      'text-rotation': 'autorotate',
      'overlay-opacity': 0,
      'text-background-color': 'white'
    }
  }
];

// const layout = {
//   name: 'grid',
//     rows: 3
// };

const layout = {
  name: 'cose',

  // Called on `layoutready`
  ready: function(){},

  // Called on `layoutstop`
  stop: function(){},

  // Whether to animate while running the layout
  // true : Animate continuously as the layout is running
  // false : Just show the end result
  // 'end' : Animate with the end result, from the initial positions to the end positions
  animate: true,

  // Easing of the animation for animate:'end'
  animationEasing: undefined,

  // The duration of the animation for animate:'end'
  animationDuration: undefined,

  // A function that determines whether the node should be animated
  // All nodes animated by default on animate enabled
  // Non-animated nodes are positioned immediately when the layout starts
  animateFilter: function ( node, i ){ return true; },


  // The layout animates only after this many milliseconds for animate:true
  // (prevents flashing on fast runs)
  animationThreshold: 250,

  // Number of iterations between consecutive screen positions update
  refresh: 20,

  // Whether to fit the network view after when done
  fit: true,

  // Padding on fit
  padding: 30,

  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,

  // Excludes the label when calculating node bounding boxes for the layout algorithm
  nodeDimensionsIncludeLabels: true,

  // Randomize the initial positions of the nodes (true) or use existing positions (false)
  randomize: false,

  // Extra spacing between components in non-compound graphs
  componentSpacing: 100,

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: function( node ){ return 4096; },

  // Node repulsion (overlapping) multiplier
  nodeOverlap: 10,

  // Ideal edge (non nested) length
  idealEdgeLength: function( edge ){ return 40; },

  // Divisor to compute edge forces
  edgeElasticity: function( edge ){ return 50; },

  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 3,

  // Gravity force (constant)
  gravity: 1,

  // Maximum number of iterations to perform
  numIter: 1000,

  // Initial temperature (maximum node displacement)
  initialTemp: 1000,

  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.99,

  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0,

};



const selectionType = 'additive';

const cyto = { style, layout, selectionType };
