const inputForm = document.getElementById("input-form");
const variableForm = document.getElementById("variable-form");
const equations = document.getElementById("equations");
inputForm.onsubmit = generate;
variableForm.onsubmit = evaluate;

const SERVER_URI = 'http://localhost:3000';

function validate(schema) {
  if (!schema.eqns.length || !schema.start || !schema.end) {
    alert('please fill in all fields!');
    return;
  }

  let exprs, lhs, rhs;
  let validStart = false, validEnd = false;
  let valid = true;
  schema.eqns.forEach((eqn, i) => {
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

    if (eqn.includes(schema.start)) {
      validStart = true;
    }
    if (eqn.includes(schema.end)) {
      validEnd = true;
    }
  });

  if (!(validStart && validEnd)) {
    alert('Invalid start/end nodes');
  }

  console.log('valid inputs!');
  return validStart && validEnd && valid;
}

async function fetchBackend({eqns, start, end}) {
  let resp = await fetch(`${SERVER_URI}/input-form`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({eqns, start, end})
  });
  if (!resp.ok) {
    throw new Error('Failed input-form');
  }

  resp = await fetch(`${SERVER_URI}/computeSFG`);
  if (!resp.ok) {
    throw new Error('Failed computeSFG');
  }
  const sfg = await resp.json();

  resp = await fetch(`${SERVER_URI}/computeMasons`);
  if (!resp.ok) {
    throw new Error('Failed computeMasons');
  }
  const tfunc = await resp.json();

  return {sfg, tfunc};
}

async function generate(event) {
  event.preventDefault();
  const form = document.getElementById("input-form");
  const formData = new FormData(form);
  const schema = {eqns: [], start: '', end: ''};

  let key;
  for (let pair of formData.entries()) {
    key = pair[0];
    if (schema.hasOwnProperty(key)) {
      schema[key] = pair[1];
    } else if (key.startsWith('equation-input-field-')) {
      schema.eqns.push(pair[1]);
    }
  }

  if (!validate(schema)) {
    alert('YOU\'RE WRONG!');
    // TODO clear fields
    return;
  }

  const {sfg, tfunc} = await fetchBackend(schema);
  localStorage.setItem('tfuncN', tfunc.n);
  localStorage.setItem('tfuncD', tfunc.d);

  renderSFG(sfg);
  renderTFunc(tfunc);
}

function evaluate(event) {
  event.preventDefault();
  const form = document.getElementById("variable-form");
  const formData = new FormData(form);

  const kv = {};
  let key, value;
  let isValid = true;
  for (let pair of formData.entries()) {
    key = pair[0];
    if (!kv.hasOwnProperty(key)) {
      value = pair[1];
      if (!isNaN(value = parseFloat(value))) {
        kv[key] = value;
      } else {
        isValid = false;
        break;
      }
    }
  }

  if (!isValid) {
    alert('Please enter all weights!');
    return;
  }

  console.log(kv);
  let n = localStorage.getItem('tfuncN');
  let d = localStorage.getItem('tfuncD');
  n = parseFloat(algebra.parse(n).eval(kv).toString());
  d = parseFloat(algebra.parse(d).eval(kv).toString());

  document.getElementById('tfunc-eval').innerHTML = (n/d);
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
          id: e.id,
          edgeWeight: e.weight,
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
  let tr, leftCell, rightCell, input, label;
  document.getElementById('edge-weight-table').innerHTML = "";
  elements.edges.forEach(({data: e}) => {
    if (isNaN(parseFloat(e.edgeWeight))) {
      // don't put duplicate weights here
      if (uniqWeights.hasOwnProperty(e.edgeWeight)) {
        return;
      } else {
        uniqWeights[e.edgeWeight] = true; // arbitrary value
      }

      tr = document.createElement('tr');
      leftCell = document.createElement('td');
      rightCell = document.createElement('td');
      input = document.createElement('input');
      label = document.createElement('label');

      input.id = `${e.edgeWeight}_${e.source}_${e.target}`;
      input.style.width = '70px';
      input.name = e.edgeWeight;
      label.innerHTML = e.edgeWeight;
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

function renderTFunc(tfunc) {
  const tfuncElem = document.getElementById('tfunc');
  const n = tfunc.n.length > 1 ? `(${tfunc.n})` : tfunc.n;
  const d = tfunc.d.length > 1 ? `(${tfunc.d})` : tfunc.d;
  tfuncElem.innerHTML = `${n} / ${d}`;
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
  span.classList.add('remove');
  span.onclick = () => {
    document.getElementById(newEqnInput.id).remove();
  };

  const children = [label, input, span];
  children.forEach(c => newEqnInput.appendChild(c));
  equations.appendChild(newEqnInput);
}
