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
	let circuit_elems = [{"id":"wire-2","type":"W","R":0,"p_from":{"x":674,"y":100},"p_to":{"x":498,"y":100}},{"id":"wire-3","type":"W","R":0,"p_from":{"x":770,"y":100},"p_to":{"x":674,"y":100}},{"id":"wire-4","type":"W","R":0,"p_from":{"x":818,"y":100},"p_to":{"x":770,"y":100}},{"id":"wire-5","type":"W","R":0,"p_from":{"x":770,"y":116},"p_to":{"x":770,"y":100}},{"id":"wire-6","type":"W","R":0,"p_from":{"x":818,"y":148},"p_to":{"x":818,"y":100}},{"id":"wire-7","type":"W","R":0,"p_from":{"x":834,"y":148},"p_to":{"x":818,"y":148}},{"id":"wire-8","type":"W","R":0,"p_from":{"x":930,"y":148},"p_to":{"x":898,"y":148}},{"id":"wire-9","type":"W","R":0,"p_from":{"x":194,"y":164},"p_to":{"x":50,"y":164}},{"id":"wire-10","type":"W","R":0,"p_from":{"x":290,"y":164},"p_to":{"x":194,"y":164}},{"id":"wire-11","type":"W","R":0,"p_from":{"x":498,"y":164},"p_to":{"x":498,"y":100}},{"id":"wire-12","type":"W","R":0,"p_from":{"x":498,"y":164},"p_to":{"x":370,"y":164}},{"id":"wire-13","type":"W","R":0,"p_from":{"x":514,"y":164},"p_to":{"x":498,"y":164}},{"id":"wire-14","type":"W","R":0,"p_from":{"x":530,"y":164},"p_to":{"x":514,"y":164}},{"id":"wire-15","type":"W","R":0,"p_from":{"x":674,"y":164},"p_to":{"x":674,"y":100}},{"id":"wire-16","type":"W","R":0,"p_from":{"x":674,"y":164},"p_to":{"x":594,"y":164}},{"id":"wire-17","type":"W","R":0,"p_from":{"x":50,"y":180},"p_to":{"x":50,"y":164}},{"id":"wire-18","type":"W","R":0,"p_from":{"x":434,"y":212},"p_to":{"x":386,"y":212}},{"id":"wire-19","type":"W","R":0,"p_from":{"x":482,"y":212},"p_to":{"x":434,"y":212}},{"id":"wire-20","type":"W","R":0,"p_from":{"x":674,"y":212},"p_to":{"x":674,"y":164}},{"id":"wire-21","type":"W","R":0,"p_from":{"x":674,"y":212},"p_to":{"x":642,"y":212}},{"id":"wire-22","type":"W","R":0,"p_from":{"x":770,"y":212},"p_to":{"x":770,"y":180}},{"id":"wire-23","type":"W","R":0,"p_from":{"x":770,"y":212},"p_to":{"x":674,"y":212}},{"id":"wire-24","type":"W","R":0,"p_from":{"x":930,"y":212},"p_to":{"x":930,"y":148}},{"id":"wire-25","type":"W","R":0,"p_from":{"x":930,"y":212},"p_to":{"x":770,"y":212}},{"id":"wire-26","type":"W","R":0,"p_from":{"x":434,"y":244},"p_to":{"x":434,"y":212}},{"id":"wire-27","type":"W","R":0,"p_from":{"x":514,"y":244},"p_to":{"x":514,"y":164}},{"id":"wire-28","type":"W","R":0,"p_from":{"x":578,"y":244},"p_to":{"x":578,"y":164}},{"id":"wire-29","type":"W","R":0,"p_from":{"x":642,"y":244},"p_to":{"x":642,"y":212}},{"id":"wire-30","type":"W","R":0,"p_from":{"x":290,"y":276},"p_to":{"x":274,"y":276}},{"id":"wire-31","type":"W","R":0,"p_from":{"x":386,"y":276},"p_to":{"x":386,"y":212}},{"id":"wire-32","type":"W","R":0,"p_from":{"x":386,"y":276},"p_to":{"x":370,"y":276}},{"id":"wire-33","type":"W","R":0,"p_from":{"x":194,"y":308},"p_to":{"x":194,"y":244}},{"id":"wire-34","type":"W","R":0,"p_from":{"x":482,"y":308},"p_to":{"x":482,"y":212}},{"id":"wire-35","type":"W","R":0,"p_from":{"x":514,"y":308},"p_to":{"x":482,"y":308}},{"id":"wire-36","type":"W","R":0,"p_from":{"x":578,"y":308},"p_to":{"x":514,"y":308}},{"id":"wire-37","type":"W","R":0,"p_from":{"x":642,"y":308},"p_to":{"x":578,"y":308}},{"id":"wire-38","type":"W","R":0,"p_from":{"x":706,"y":308},"p_to":{"x":642,"y":308}},{"id":"wire-39","type":"W","R":0,"p_from":{"x":434,"y":340},"p_to":{"x":434,"y":324}},{"id":"wire-40","type":"W","R":0,"p_from":{"x":434,"y":340},"p_to":{"x":402,"y":340}},{"id":"wire-41","type":"W","R":0,"p_from":{"x":274,"y":388},"p_to":{"x":274,"y":276}},{"id":"wire-42","type":"W","R":0,"p_from":{"x":402,"y":388},"p_to":{"x":402,"y":340}},{"id":"wire-43","type":"W","R":0,"p_from":{"x":402,"y":388},"p_to":{"x":354,"y":388}},{"id":"wire-44","type":"W","R":0,"p_from":{"x":418,"y":388},"p_to":{"x":402,"y":388}},{"id":"wire-45","type":"W","R":0,"p_from":{"x":562,"y":388},"p_to":{"x":498,"y":388}},{"id":"wire-46","type":"W","R":0,"p_from":{"x":706,"y":388},"p_to":{"x":706,"y":308}},{"id":"wire-47","type":"W","R":0,"p_from":{"x":706,"y":388},"p_to":{"x":642,"y":388}},{"id":"wire-48","type":"W","R":0,"p_from":{"x":50,"y":420},"p_to":{"x":50,"y":260}},{"id":"wire-49","type":"W","R":0,"p_from":{"x":194,"y":420},"p_to":{"x":194,"y":388}},{"id":"wire-50","type":"W","R":0,"p_from":{"x":194,"y":420},"p_to":{"x":50,"y":420}},{"id":"wire-51","type":"W","R":0,"p_from":{"x":274,"y":420},"p_to":{"x":274,"y":388}},{"id":"wire-52","type":"W","R":0,"p_from":{"x":274,"y":420},"p_to":{"x":194,"y":420}},{"id":"C1","type":"C","R":0,"p_center":{"x":514,"y":270}},{"id":"C2","type":"C","R":0,"p_center":{"x":578,"y":270}},{"id":"C3","type":"C","R":0,"p_center":{"x":642,"y":270}},{"id":"R1","type":"R","R":0,"p_center":{"x":434,"y":284}},{"id":"R2","type":"R","R":90,"p_center":{"x":602,"y":388}},{"id":"R3","type":"R","R":90,"p_center":{"x":458,"y":388}},{"id":"R4","type":"R","R":270,"p_center":{"x":314,"y":388}},{"id":"C4","type":"C","R":90,"p_center":{"x":568,"y":164}},{"id":"V2","type":"V","R":0,"p_center":{"x":194,"y":204}},{"id":"V3","type":"V","R":180,"p_center":{"x":194,"y":348}},{"id":"V4","type":"V","R":90,"p_center":{"x":330,"y":276}},{"id":"R5","type":"R","R":180,"p_center":{"x":50,"y":220}},{"id":"C5","type":"C","R":180,"p_center":{"x":770,"y":154}},{"id":"C6","type":"C","R":90,"p_center":{"x":872,"y":148}},{"id":"G1","type":"G","R":90,"p_center":{"x":330,"y":164}}]
	let nodes = [{"id":1,"components":["C1","C3","C4","C4","C5","C5","C6","C6","G1"],"p":{"x":656,"y":181}},{"id":2,"components":["V2","R5","G1"],"p":{"x":191,"y":196}},{"id":3,"components":["C1","C2","C3","R1","R2","V4"],"p":{"x":516,"y":293}},{"id":4,"components":["C2"],"p":{"x":578,"y":270}},{"id":5,"components":["R4","V3","V4","R5"],"p":{"x":222,"y":308}},{"id":6,"components":["V2","V3"],"p":{"x":194,"y":276}},{"id":7,"components":["R1","R3","R4"],"p":{"x":402,"y":353}},{"id":8,"components":["R2","R3"],"p":{"x":530,"y":388}}];

	console.log(circuit_elems);
	let circuit_canvas = document.getElementById(canvas_id);
	let elem;
	circuit_elems.forEach( c => {
		elem = Element.create(c.type, c.id, c.p_center, c.R,
			c.p_from, c.p_to);

		circuit_canvas.appendChild(elem);
	});
};
