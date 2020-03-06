const _SVG_NS_ = 'http://www.w3.org/2000/svg';

const _RESISTOR_TYPE_ = 'R';
const _INDEP_VOLTAGE_TYPE_ = 'V';
const _INDEP_CURRENT_TYPE_ = 'I';

const _NODE_RADIUS_ = 4;
const _LINE_WIDTH_ = 2;
const _DEFAULT_COLOR_ = '#000';

const _RESISTOR_SLOPE = 0.5;

/*
 * Generic SVG element create functions
 */
const createSVGGroup = () => document.createElementNS(_SVG_NS_, 'g');
const createSVGElem = (elem) => document.createElementNS(_SVG_NS_, elem);


/**
 * Creates element specified by 'type'
 * Returns svg <g> element
 *
 * @param type - type of element to create (R | V | I | C ...)
 * @param id   - id of element - will be used as the label
 * @param coord1 - coordinate of positive node {x: _x, y: _y}
 * @param coord2 - coordinate of negative node {x: _x, y: _y}
 */
const create = (type, id, coord1, coord2) => {
  console.log(`Creating element: {type: ${type}, id: ${id}, 
  coord1: (${coord1.x}, ${coord1.y}), coord2: (${coord2.x}, ${coord2.y})`);

  let element = createSVGGroup();
  createNodes(coord1, coord2).forEach( n => element.appendChild(n));
  switch(type) {
    case _RESISTOR_TYPE_:
      element.appendChild(
        Resistor(id, coord1, coord2));
      break;
    case _INDEP_VOLTAGE_TYPE_:
      element.appendChild(
        IndependentVoltage(id, coord1, coord2));
      break;
    case _INDEP_CURRENT_TYPE_:
      element.appendChild(
        IndependentCurrent(id, coord1, coord2));
      break;
    default:
      break;
  }
  return element;
};

const createNodes = (coord1, coord2) => {
  let nodes = [];
  nodes.push(Node(coord1));
  nodes.push(Node(coord2));
  return nodes;
};


const isHorizontal = (coord1, coord2) => coord1.y === coord2.y;

const createLines = (coord1, coord2, fract) => {
  let lines = [];
  let x1 = parseFloat(coord1.x), y1 = parseFloat(coord1.y);
  let x2 = parseFloat(coord2.x), y2 = parseFloat(coord2.y);
  let line_pos1 = {};
  let line_pos2 = {};

  /* Case 1: horizontal line */
  if (y1 === y2) {
    const width = Math.abs(x2 - x1);

    /* line 1 */
    line_pos1 = {x: x1, y: y1};
    line_pos2 = {x: x1 + width*fract, y: y1};
    lines.push(Line(line_pos1, line_pos2));

    /* line 2 */
    line_pos1 = {x: x2, y: y2};
    line_pos2 = {x: x2 - width*fract, y: y2};
    lines.push(Line(line_pos1, line_pos2));

  }
  /* Case 2: vertical line */
  else {
    const height = Math.abs(y2 - y1);

    /* line 1 */
    line_pos1 = {x: x1, y: y1};
    line_pos2 = {x: x1, y: y1 + height*fract};
    lines.push(Line(line_pos1, line_pos2));

    line_pos1 = {x: x2, y: y2};
    line_pos2 = {x: x2, y: y2 - height*fract};
    lines.push(Line(line_pos1, line_pos2));
  }
  return lines;
};

/**
 * Functions to create each circuit element type
 * @returns {SVGElement}
 */

const Node = (coord) => {
  console.log('CREATING NODE...');
  let node = createSVGElem('circle');
  node.setAttribute('cx', coord.x);
  node.setAttribute('cy', coord.y);
  node.setAttribute('r', _NODE_RADIUS_);
  return node;
};

const Line = (coord1, coord2) => {
  let line = createSVGElem('line');
  line.setAttribute('x1', coord1.x);
  line.setAttribute('x2', coord2.x);
  line.setAttribute('y1', coord1.y);
  line.setAttribute('y2', coord2.y);
  line.setAttribute('stroke-width', _LINE_WIDTH_);
  line.setAttribute('stroke', _DEFAULT_COLOR_);
  return line;
};

/**
 * Create RESISTOR element - made of 3 SVG Elements
 * -  2 lines
 * -  Middle zig-zag portion
 *
 * @param id
 * @param coord1
 * @param coord2
 * @returns {SVGGElement}
 * @constructor
 */
const resistorSymbol = (coord1, coord2, fract) => {
  /* Get fraction of line that the symbol has to fit in */
  let x1 = parseFloat(coord1.x), y1 = parseFloat(coord1.y);
  let x2 = parseFloat(coord2.x), y2 = parseFloat(coord2.y);

  let d = 'M';
  let startx, starty, endx, endy;
  if (isHorizontal(coord1, coord2)) {
    const width = x2- x1;
    startx = x1 + width*fract;
    starty = y1;
    endx = x2 - width*fract;

    const interval = (endx - startx)/6;
    let i=0, x, y;
    for (; i<7; i++) {
      x = startx + i * interval;
      y = i%2 === 0 ? starty : starty - 30;
      d += `${x},${y} `;
    }

  } else {
    const height = y2 - y1;
    startx = x1;
    starty = y1 + height*fract;
    endx = x2;
    endy = y2 - height*fract;

  }

  let symbol = createSVGElem('path');
  symbol.setAttribute('d', d);
  symbol.setAttribute('stroke-width', _LINE_WIDTH_);
  symbol.setAttribute('stroke', _DEFAULT_COLOR_);
  symbol.setAttribute('fill', 'none');
  symbol.setAttribute('fill-opacity', null);
  return symbol;
};


const Resistor = (id, coord1, coord2) => {
  console.log('CREATING RESISTOR...');
  let resistor = createSVGGroup();
  createLines(coord1, coord2, 0.35).forEach(
    l => resistor.appendChild(l)
  );
  resistor.appendChild(
    resistorSymbol(coord1, coord2, 0.35));
  return resistor;
};

/**
 * Create independent voltage source - 5 SVG elements
 * -  2 lines
 * -  1 circle
 * -  2 text elements - [+/-]
 *
 * @param id
 * @param coord1
 * @param coord2
 * @returns {SVGGElement}
 * @constructor
 */
const independentSymbol = (coord1, coord2, fract) => {
  let x1 = parseFloat(coord1.x), y1 = parseFloat(coord1.y);
  let x2 = parseFloat(coord2.x), y2 = parseFloat(coord2.y);
  let width, centre, startx, starty, endx, endy;
  if (isHorizontal(coord1, coord2)) {
    const width = Math.abs(x2 - x1);
    startx = x1 + width*fract;
    starty = y1;
    endx = x2 - width*fract;

    length = Math.abs(endx - startx);
    centre = { x: startx + (endx - startx)/2, y: starty };
  } else {
    const height = Math.abs(y2 - y1);
    startx = x1;
    starty = y1 + height*fract;
    endy = y2 - height*fract;

    length = Math.abs(endy - starty);
    centre = { x: startx, y: starty + (endy - starty)/2}
  }

  let symbol = createSVGElem('circle');
  symbol.setAttribute('r', length/2);
  symbol.setAttribute('cx', centre.x);
  symbol.setAttribute('cy', centre.y);
  symbol.setAttribute('fill', 'none');
  symbol.setAttribute('stroke-width', _LINE_WIDTH_);
  symbol.setAttribute('stroke', _DEFAULT_COLOR_);
  return symbol;
};

const voltageSigns = (coord1, coord2, fract) => {

};

const IndependentVoltage = (id, coord1, coord2) => {
  console.log('CREATING INDEPENDENT VOLTAGE SOURCE...');
  let voltage_src = createSVGGroup();
  createLines(coord1, coord2, 1/3).forEach(
    l => voltage_src.appendChild(l)
  );
  voltage_src.appendChild(independentSymbol(coord1, coord2, 1/3));
  return voltage_src;
};

const IndependentCurrent = (id, coord1, coord2) => {
  console.log('CREATING INDEPENDENT CURRENT...');
  let current_src = createSVGGroup();
  createLines(coord1, coord2, 1/3).forEach(
    l => current_src.appendChild(l)
  );
  current_src.appendChild(independentSymbol(coord1, coord2, 1/3));
  return current_src;

};

const Element = { create };