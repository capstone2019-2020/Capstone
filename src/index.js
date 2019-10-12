const inputForm = document.getElementById("input-form");
const equations = document.getElementById("equations");
inputForm.onsubmit = generate;

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

  // TODO error check data types for schema
  console.log("SCHEMA:", schema);
  event.preventDefault();
}

function addEquation() {
  const ind = equations.childElementCount - 1;
  const newEqnInput = document.createElement('div');
  newEqnInput.id = `equation-input-${ind}`;

  const input = document.createElement('input');
  const label = document.createElement('label');
  const span = document.createElement('span');

  input.id = `equation-input-field-${ind}`;
  input.name = input.id;
  label.for = input.id;
  span.innerHTML = 'remove';
  span.onclick = () => {
    document.getElementById(newEqnInput.id).remove();
  };

  const children = [label, input, span];
  children.forEach(c => newEqnInput.appendChild(c));
  equations.appendChild(newEqnInput);
}
