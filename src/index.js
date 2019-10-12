const inputForm = document.getElementById("input-form");
const equations = document.getElementById("equations");
inputForm.onsubmit = generate;


function validate(schema) {
  if (!schema.equations.length || !schema.start_node || !schema.end_node) {
    alert('please fill in all fields!');
    return;
  }

  let exprs, lhs, rhs;
  let validStart = false, validEnd = false;
  let valid = true;
  schema.equations.forEach((eqn, i) => {
    if (!eqn.match(/^[a-zA-Z0-9_\/*\-+\s=]*$/)) {
      valid = false;
      alert(`equation # ${i} contains unaccepted characters`);
    }
    if (!eqn.includes('=')) {
      valid = false;
      alert(`equation # ${i} must contain =`);
    }
    exprs = eqn.split('=');
    if (exprs.length > 2) {
      valid = false;
      alert(`equation # ${i} contains more than 1 equals`);
    }
    ([lhs, rhs] = exprs);
    if (lhs.trim().split(' ').length !== 1) {
      valid = false;
      alert(`equation # ${i} contains more than 1 term on LHS`);
    }

    if (eqn.includes(schema.start_node)) {
      validStart = true;
    }
    if (eqn.includes(schema.end_node)) {
      validEnd = true;
    }
  });

  if (!(validStart && validEnd)) {
    alert('Invalid start/end nodes');
  }

  console.log('valid inputs!');
  return validStart && validEnd && valid;
}

function generate(event) {
  const form = document.getElementById("input-form");
  const formData = new FormData(form);

  const schema = {
    equations: [],
    start_node: '',
    end_node: ''
  };

  let key;
  for (let pair of formData.entries()) {
    key = pair[0];
    if (schema.hasOwnProperty(key)) {
      schema[key] = pair[1];
    } else if (key.startsWith('equation-input-field-')) {
      schema.equations.push(pair[1]);
    }
  }

  if (!validate(schema)) {
    alert('YOU\'RE WRONG!');
    // TODO clear fields
    return;
  }

  renderSFG();
  event.preventDefault();
}

function renderSFG() {
  cytoscape({
    container: document.getElementById('sfg_canvas'), // container to render in
    elements: { // list of graph elements to start with
      nodes: [
        { // node a
          data: { id: 'x0' }
        },
        { // node b
          data: { id: 'x1' }
        },
        { // node c
          data: { id: 'x2' }
        },
        { // node d
          data: { id: 'x3' }
        },
        { // node d
          data: { id: 'x4' }
        }],
      edges: [
        { // edge ab
          data: { id: '1', source: 'x0', target: 'x1' }
        },
        { // edge bc
          data: { id: 'a', source: 'x1', target: 'x2' }
        },
        { // edge ab
          data: { id: 'b', source: 'x2', target: 'x3' }
        },
        { // edge ab
          data: { id: '123', source: 'x3', target: 'x4' }
        },
        { // edge ab
          data: { id: 'd', source: 'x4', target: 'x3' }
        },
        { // edge ab
          data: { id: 'e', source: 'x4', target: 'x0' }
        }]
    },
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'curve-style': 'bezier',
          'control-point-distance': '50px',
          'control-point-weight': '0.7', // '0': curve towards source node, '1': towards target node.
          'edge-distances': 'intersection',
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'label': 'data(id)'
        }
      }
    ],
    layout: {
      name: 'grid',
      rows: 1
    }
  });
}

function addEquation() {
  const ind = equations.childElementCount - 1;
  const newEqnInput = document.createElement('div');
  newEqnInput.id = `equation-input-${ind}`;
  newEqnInput.style.marginBottom = '5px';

  const input = document.createElement('input');
  const label = document.createElement('label');
  const span = document.createElement('span');

  input.id = `equation-input-field-${ind}`;
  input.name = input.id;
  label.for = input.id;
  span.innerHTML = 'remove';
  span.style.paddingLeft = '5px';
  span.style.fontStyle = 'italic';
  span.style.cursor = 'pointer';
  span.onclick = () => {
    document.getElementById(newEqnInput.id).remove();
  };

  const children = [label, input, span];
  children.forEach(c => newEqnInput.appendChild(c));
  equations.appendChild(newEqnInput);
}
