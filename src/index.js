const inputForm = document.getElementById("input-form");
const variableForm = document.getElementById("variable-form");
const equations = document.getElementById("equations");
inputForm.onsubmit = generate;
variableForm.onsubmit = evaluate;

const test_sfg = [{"id":"x_0","outgoingEdges":[{"id":"e_x_0x_1","weight":"a_10","startNode":"x_0","endNode":"x_1"},{"id":"e_x_0x_3","weight":"a_30","startNode":"x_0","endNode":"x_3"},{"id":"e_x_0x_4","weight":"a_40","startNode":"x_0","endNode":"x_4"},{"id":"e_x_0x_5","weight":"a_50","startNode":"x_0","endNode":"x_5"}]},{"id":"x_1","outgoingEdges":[{"id":"e_x_1x_0","weight":"-a_01","startNode":"x_1","endNode":"x_0"},{"id":"e_x_1x_3","weight":"-a_31","startNode":"x_1","endNode":"x_3"}]},{"id":"x_2","outgoingEdges":[{"id":"e_x_2x_0","weight":"-a_02","startNode":"x_2","endNode":"x_0"},{"id":"e_x_2x_1","weight":"a_12","startNode":"x_2","endNode":"x_1"},{"id":"e_x_2x_3","weight":"a_32","startNode":"x_2","endNode":"x_3"},{"id":"e_x_2x_4","weight":"-a_42","startNode":"x_2","endNode":"x_4"}]},{"id":"x_4","outgoingEdges":[{"id":"e_x_4x_0","weight":"-a_04","startNode":"x_4","endNode":"x_0"},{"id":"e_x_4x_2","weight":"a_24","startNode":"x_4","endNode":"x_2"},{"id":"e_x_4x_5","weight":"-a_54","startNode":"x_4","endNode":"x_5"}]},{"id":"x_5","outgoingEdges":[{"id":"e_x_5x_0","weight":"a_05","startNode":"x_5","endNode":"x_0"},{"id":"e_x_5x_1","weight":"a_15","startNode":"x_5","endNode":"x_1"},{"id":"e_x_5x_2","weight":"a_25","startNode":"x_5","endNode":"x_2"},{"id":"e_x_5x_3","weight":"-a_35","startNode":"x_5","endNode":"x_3"}]},{"id":"x_3","outgoingEdges":[{"id":"e_x_3x_1","weight":"a_13","startNode":"x_3","endNode":"x_1"},{"id":"e_x_3x_4","weight":"-a_43","startNode":"x_3","endNode":"x_4"}]}];

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

  // fetch shit
  renderSFG(test_sfg);
  event.preventDefault();
}

function evaluate(event) {
  alert('evaluating!');
  const form = document.getElementById("variable-form");
  const formData = new FormData(form);

  let key;
  for (let pair of formData.entries()) {
    key = pair[0];
    console.log(key);
  }

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

function renderSFG(sfg) {
  const elements = sfgToCyto(sfg);
  cytoscape({
    container: document.getElementById('sfg_canvas'), // container to render in
    elements,
    style: cyto.style,
    layout: cyto.layout
  });

  // reset weights list
  const uniqWeights = {};
  document.getElementById('edge-weight-table').innerHTML = "";
  elements.edges.forEach(({data: e}) => {
    if (isNaN(parseFloat(e.id))) {
      // don't put duplicate weights here
      if (uniqWeights.hasOwnProperty(e.id)) {
        return;
      } else {
        uniqWeights[e.id] = true; // arbitrary value
      }

      const tr = document.createElement('tr');
      const leftCell = document.createElement('td');
      const rightCell = document.createElement('td');
      const input = document.createElement('input');
      const label = document.createElement('label');

      input.id = `${e.id}_${e.source}_${e.target}`;
      input.style.width = '70px';
      input.name = e.id;
      label.innerHTML = e.id;
      label.for = input.id;
      leftCell.style.width = '70px';
      leftCell.style.textAlign = 'right';
      leftCell.style.paddingRight = '5px';

      leftCell.appendChild(label);
      rightCell.appendChild(input);
      const children = [leftCell, rightCell];
      children.forEach(c => tr.appendChild(c));
      document.getElementById('edge-weight-table').appendChild(tr);
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
