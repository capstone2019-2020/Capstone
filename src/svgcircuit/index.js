const _SVG_ROOT_DIR_ = 'svg/';
const _RESISTOR_FILE_ = _SVG_ROOT_DIR_ + 'resistor.svg';
const _INDEPENDENT_VOLTAGE_FILE_ = _SVG_ROOT_DIR_ + 'indep-voltage.svg';
const _INDEPENDENT_CURRENT_FILE_ = _SVG_ROOT_DIR_ + 'indep-current.svg';

const _RESISTOR_TYPE_ = 'R';
const _INDEP_VOLTAGE_TYPE_ = 'V';
const _INDEP_CURRENT_TYPE_ = 'I';

const rotate = (theta, elem_id) => {
	let elem = document.getElementById(elem_id);
	elem.style.transform = `rotate(${theta}deg)`;
};

const getSVGFilePath = (type) => {
	switch(type) {
		case _RESISTOR_TYPE_:
			return _RESISTOR_FILE_;
		case _INDEP_VOLTAGE_TYPE_:
			return _INDEPENDENT_VOLTAGE_FILE_;
		case _INDEP_CURRENT_TYPE_:
			return _INDEPENDENT_CURRENT_FILE_;	
		default:
			return _RESISTOR_FILE_;		
	}
};

const createElem = (type, elem_id, params) => {
	let elem = document.createElement('object');
	elem.type = 'image/svg+xml';
	elem.data = getSVGFilePath(type);
	elem.setAttribute('id', elem_id);
	return elem;
};

/* NOT USED:  doesn't look like we can pass in parameters
to SVG at the moment*/
const createObjParams = (params) => {
	let param_elems = [];
	let elem; 
	Object.keys(params).forEach( (key) => {
		elem = document.createElement('PARAM');
		elem.setAttribute('name', key);
		elem.setAttribute('value', params[key]);
		param_elems.push(elem);
	});

	return param_elems;
};

const generateCircuit = (canvas_id) => {
	const netlist = document.getElementById('netlist');
	const circuit_elems = netlist.value.split(/\n/);
	console.log(circuit_elems);

	/* Create SVG object for each element*/
	let circuit_canvas = document.getElementById(canvas_id);
	circuit_elems.forEach( c => {
		const prop = c.split(' ');
		const elem_id = prop[0];
		const elem_type = elem_id.charAt(0);
		const elem = createElem(elem_type, elem_id);

		circuit_canvas.appendChild(elem);
	});
};
