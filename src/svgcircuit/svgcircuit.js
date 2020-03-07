const generateCircuit = (canvas_id) => {
	const netlist = document.getElementById('netlist');
	const circuit_elems = netlist.value.split(/\n/);
	console.log(circuit_elems);

	/* Create SVG object for each element*/
	let circuit_canvas = document.getElementById(canvas_id);
	let prop, elem, elem_id, elem_type,
		positive_node, negative_node;
	circuit_elems.forEach( c => {
		prop = c.split(' ');
		elem_id = prop[0];
		elem_type = elem_id.charAt(0);
		positive_node = {x: prop[4], y: prop[5]};
		negative_node = {x: prop[6], y: prop[7]};

		elem = Element.create(elem_type, elem_id,
			positive_node, negative_node);

		circuit_canvas.appendChild(elem);
	});
};