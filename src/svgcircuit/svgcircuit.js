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

const generateCircuit = (canvas_id) => {
	let circuit_elems =[{"id":"wire-2","type":"W","R":0,"p_from":{"x":256,"y":16},"p_to":{"x":128,"y":16}},{"id":"wire-3","type":"W","R":0,"p_from":{"x":432,"y":16},"p_to":{"x":336
			,"y":16}},{"id":"wire-4","type":"W","R":0,"p_from":{"x":128,"y":112},"p_to":{"x":128,"y":16}},{"id":"wire-5","type":"W","R":0,"p_from":{"x":432,"y":128},"p_to":{"x":432,"y":16}}
		,{"id":"wire-6","type":"W","R":0,"p_from":{"x":128,"y":256},"p_to":{"x":128,"y":192}},{"id":"wire-7","type":"W","R":0,"p_from":{"x":432,"y":256},"p_to":{"x":432,"y":192}},{"id":
				"V1","type":"V","R":0,"p_center":{"x":128,"y":96}},{"id":"R1","type":"R","R":90,"p_center":{"x":352,"y":0}},{"id":"C1","type":"C","R":0,"p_center":{"x":416,"y":128}},{"id":"G1",
			"type":"G","R":0,"p_center":{"x":0,"y":16}}];

	console.log(circuit_elems);
	let circuit_canvas = document.getElementById(canvas_id);
	let elem;
	circuit_elems.forEach( c => {
		elem = Element.create(c.type, c.id, c.p_center, c.R,
			c.p_from, c.p_to);

		circuit_canvas.appendChild(elem);
	});
};
