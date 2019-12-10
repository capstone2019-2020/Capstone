let ORIGIN_X = 100;
const START_X = 100;
let ORIGIN_Y = 450;
const START_Y = 450;
const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_GRAPH_ID = 'svg-graph';

/* fake macros */
const ROUND = (f) => parseFloat(Math.round(f*100)/100).toFixed(0);
const FIXED = (f, d) => parseFloat(Math.round(f*100)/100).toFixed(d);
const OFFSET = (margin, idx) => margin * idx;
const SCALE_VAL = (part, i) => part * i;
const HALF = (v) => v/2;
const UP = (ref, offset) => ref-offset;
const DOWN = (ref, offset) => ref+offset;
const LEFT = (ref, offset) => ref-offset;
const RIGHT = (ref, offset) => ref+offset;
const SCALE = (v, r) => v * r;
const RATIO = (c1, c2) => c1 / c2;
const MAX = (s1, s2) => s1 > s2 ? s1 : s2;
const MIN = (s1, s2) => s1 < s2 ? s1 : s2;

function Svgraph() {
  return document.getElementById(SVG_GRAPH_ID);
}

function g(id, ...children) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('id', id);

  if (children) {
    children.forEach(c => g.appendChild(c));
  }
  return g;
}

function __ns(elem, config={}) {
  Object.keys(config).forEach(k => {
    if (!elem.hasAttribute(k)) {
      elem.setAttribute(k, config[k]);
    }
  });

  return elem;
}

function line(x1, x2, y1, y2, config={}) {
  const l = document.createElementNS(SVG_NS, 'line');

  return __ns(l, {
    ...config,
    x1, x2, y1, y2
  });
}

function text(x, y, words, config={}) {
  const t = document.createElementNS(SVG_NS, 'text');
  t.innerHTML = words;

  return __ns(t, {
    ...config,
    x, y
  });
}

function plot(dp, x_cratio, y_cratio, color) {
  let points = '';
  let i;
  let x_coord, y_coord;
  for (i=0; i<dp.length; i++) {
    x_coord = RIGHT(ORIGIN_X, SCALE(dp[i].x, x_cratio));
    y_coord = UP(ORIGIN_Y,SCALE(dp[i].y, y_cratio));
    points += `${x_coord},${y_coord}`;
    if (i+1 !== dp.length) {
      points += ' ';
    }
  }

  const p = document.createElementNS(SVG_NS, 'polyline');
  return __ns(p, {
    'points': points,
    'stroke': color,
    'fill': 'none'
  });
}

function xaxis({leny, lenx, lb, ub, parts, label, grid}) {
  let partitions = [];
  let i, x_coord, xval;
  const margin = lenx / parts;
  const part_val = (ub-lb) / parts;

  /*
   * Rendering x-axis intervals and text for each interval
   */
  for (i=0; i<=parts; i++) {
    x_coord = RIGHT(START_X, OFFSET(margin, i));
    partitions.push(
      line(x_coord, x_coord, DOWN(ORIGIN_Y, 5),
        UP(ORIGIN_Y, 5), {
          'stroke': 'black'
        }
      )
    );
    xval = ROUND(lb+SCALE_VAL(part_val, i));
    partitions.push(
      text(RIGHT(x_coord, 5), DOWN(ORIGIN_Y, 20),
        xval, {'text-anchor': 'end'}
      )
    );

    if (grid && xval !== 0) {
      partitions.push(
        line(x_coord, x_coord, UP(START_Y, 5),
          UP(START_Y, leny), {
            'stroke': 'grey',
            'stroke-dasharray': '4,6'
          }
        )
      );
    }
  }

  return [
    text(RIGHT(START_X, HALF(lenx)),
      DOWN(START_Y, 50), label, {
      'text-anchor': 'end'
    }),
    line(START_X, RIGHT(START_X, lenx),
      ORIGIN_Y, ORIGIN_Y, {
        'stroke': 'black'
      }
    ),
    ...partitions
  ];
}

function yaxis({leny, lenx, lb, ub, parts, label, grid}) {
  leny = START_Y-leny < 0 ? START_Y : leny;

  let partitions = [];
  let i, y_coord, yval;
  const margin = leny / parts;
  const part_val = (ub-lb) / parts;
  for (i=0; i<=parts; i++) {
    y_coord = START_Y - OFFSET(margin, i);
    partitions.push(
      line(LEFT(ORIGIN_X,5), RIGHT(ORIGIN_X,5),
        y_coord, y_coord, {
          'stroke': 'black'
        }
      )
    );
    yval = FIXED(lb+SCALE_VAL(part_val, i), 2);
    partitions.push(
      text(LEFT(ORIGIN_X,10), DOWN(y_coord,5),
        yval, {
        'text-anchor': 'end'
      })
    );

    if (grid && yval !== '0.00') {
      partitions.push(
        line(RIGHT(START_X,5), RIGHT(START_X,lenx),
          y_coord, y_coord, {
            'stroke': 'grey',
            'stroke-dasharray': '4,6'
          }
        )
      );
    }
  }

  return [
    text(LEFT(START_X, 60),
      UP(START_Y, DOWN(HALF(leny),40)),
      label, {
        'style': 'text-orientation: sideways; writing-mode: vertical-lr;',
        'text-anchor': 'start'
      }
    ),
    line(ORIGIN_X, ORIGIN_X, UP(START_Y,leny),
      START_Y, {
        'stroke': 'black'
      }
    ),
    ...partitions
  ]
}

function init_plot(lb, ub, plot_len, parts) {
  const part_val = (ub-lb) / parts;
  let i, val;
  for (i=0; i<=parts; i++) {
    val = FIXED(lb+SCALE_VAL(part_val, i), 2);
    console.log(val);
    if (val === '0.00' || val === '-0.00') {
      return OFFSET(plot_len / parts, i);
    }
  }
}

function init() {
  const SAMPLE_RATE = 300;
  const lenx = 600, leny = 400;
  const y_grid = 10;
  const x_grid = 10;
  let x_lb = -10, x_ub = 10, y_lb = 0, y_ub = 0;

  const parser = math.parser();
  parser.evaluate('f(x) = x^2');
  let points = [];
  let i=0, xval, yval;
  const sample_amt = (x_ub-x_lb) / (x_grid*SAMPLE_RATE);
  for (xval=x_lb; xval<x_ub; xval+=sample_amt) {
    yval = parser.evaluate(`f(${xval})`);
    y_ub = MAX(yval, y_ub);
    y_lb = MIN(yval, y_lb);

    points.push({
      x: xval,
      y: yval
    });

    i++;
  }

  ORIGIN_X = RIGHT(START_X, init_plot(x_lb, x_ub, lenx, x_grid));
  ORIGIN_Y = START_Y - init_plot(y_lb, y_ub, leny, y_grid);

  /* plot */
  const p = g('plot', plot(points, RATIO(lenx, x_ub-x_lb),
    RATIO(leny, y_ub-y_lb), 'blue'));

  /* x-axis */
  const x = g('x-axis', ...xaxis({
    leny,
    lenx,
    lb: x_lb,
    ub: x_ub,
    parts: x_grid,
    label: 'X_AXIS_LABEL',
    grid: true
  }));

  /* y-axis */
  const y = g('y-axis', ...yaxis({
    leny,
    lenx,
    lb: y_lb,
    ub: y_ub,
    parts: y_grid,
    label: 'Y_AXIS_LABEL',
    grid: true
  }));

  Svgraph().appendChild(g('wrapper', p, x, y));
}
