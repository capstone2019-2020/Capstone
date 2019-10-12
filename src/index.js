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

function sfgToCyto(sfg) {
  if (!sfg) {
    return;
  }

  const nodes = [], edges = [];
  sfg.forEach(n => {
    nodes.push({
      data: {id: n.id}
    });

    n.outgoingEdges.forEach(e => {
      edges.push({
        data: {
          id: e.weight,
          source: e.startNode,
          target: e.endNode
        }
      });
    });
  });

  return {nodes, edges};
}

function renderSFG() {
  cytoscape({
    container: document.getElementById('sfg_canvas'), // container to render in
    elements: sfgToCyto(),
    style: cyto.style,
    layout: cyto.layout
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
