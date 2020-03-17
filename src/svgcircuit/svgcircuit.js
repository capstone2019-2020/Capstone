/*
 * Initial implementation of circuit generation,
 * Does netlist parsing. New implementation assumes the netlist
 * was already parsed.
 * @deprecated
 */
const generateCircuit_deprecated = (canvas_id) => {
	const netlist = document.getElementById('netlist');
	const circuit_elems = netlist.value.split(/\n/);
	console.log(circuit_elems);

	/* Create SVG object for each element*/
	let circuit_canvas = document.getElementById(canvas_id);
	let prop, elem, elem_id, elem_type, centre, R,
		from, to;

	circuit_elems.forEach( c => {
		prop = c.split(' ');
		elem_id = prop[0];
		elem_type = elem_id.charAt(0);
		centre = {x: parseFloat(prop[4]), y: parseFloat(prop[5])};
		R = parseFloat(prop[6]);
		from = {x: prop[7], y: prop[8], id: prop[1]};
		to = {x: prop[9], y: prop[10], id: prop[2]};

		elem = Element.create(elem_type, elem_id, centre, R,
			from, to);

		circuit_canvas.appendChild(elem);
	});
};

const generateCircuit = (canvas_id, circuit_elems) => {
	console.log(circuit_elems);
	let circuit_canvas = document.getElementById(canvas_id);
	let elem;
	circuit_elems.forEach( c => {
		elem = Element.create(c.type, c.id, c.p_center, c.R,
			c.p_from, c.p_to);

		circuit_canvas.appendChild(elem);
	});
};

