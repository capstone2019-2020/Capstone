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

const putCircuitToForeground = () => {
	// TODO: change circuit colours to foreground colours
};

