const SVG_NS = 'http://www.w3.org/2000/svg';

let ORIGIN_X = 100, ORIGIN_Y = 450; /* These change depending on graph */
const START_X = 100, START_Y = 450;
const LENGTH_X = 600, LENGTH_Y = 400;
const ID_GRAPH_SVG = 'svg-graph';
const ID_GUIDE_X = 'x-guide';
const ID_GUIDE_Y = 'y-guide';

let IS_SHOW_GUIDE = true;

/* fake macros */
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

const __X = (x, xlb, xub) => (x-START_X)/RATIO(LENGTH_X, xub-xlb)+xlb;
const __Y = (y, ylb, yub) => (START_Y-y)/RATIO(LENGTH_Y, yub-ylb)+ylb;
const SAMPLE_IDX = (x) => {};

/* Math related "macros" */
const __ROUND = (f) => parseFloat(Math.round(f*100)/100);
const EXP = (f, d) => f.toExponential(d);
const ROUND = (f) => __ROUND(f).toFixed(0);
const FIXED = (f, d) => __ROUND(f).toFixed(d);
const ROUND_UP = (f, n) => {
  if (f === 0) return f;
  let r;
  if ((r = Math.abs(f) % n) === 0)
    return f;

  return f < 0 ? - (Math.abs(f) - r) : (f+n-r);
};

const Svgraph = () => document.getElementById(ID_GRAPH_SVG);

const __Guide = (guideId, vec1, vec2) => {
  const guide = document.getElementById(guideId);
  if (!vec1 || !vec2) return guide;

  if (!guide) {
    Svgraph().appendChild(
      line(vec1, vec2, {
        id: guideId, 'stroke': 'purple',
        'stroke-opacity': 0.3
      })
    );
  } else {
    __ns(guide, {
      x1: vec1.x, y1: vec1.y,
      x2: vec2.x, y2: vec2.y
    });
  }
};

function svg(id, ...children) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('id', id);

  if (children) {
    children.forEach(c => svg.appendChild(c));
  }
  return svg;
}

function g(id, ...children) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('id', id);

  if (children) {
    children.forEach(c => g.appendChild(c));
  }
  return g;
}

function __vec(x, y) {
  return { x, y };
}

function __ns(elem, config={}, ...children) {
  Object.keys(config).forEach(k => {
    // if (!elem.hasAttribute(k)) {
      elem.setAttribute(k, config[k]);
    // }
  });

  if (children) {
    children.forEach(c => elem.appendChild(c));
  }

  return elem;
}

function line(vec_from, vec_to, config={}) {
  const l = document.createElementNS(SVG_NS, 'line');
  l.style.zIndex = '1';

  return __ns(l, {
    ...config,
    x1: vec_from.x, y1: vec_from.y,
    x2: vec_to.x  , y2: vec_to.y
  });
}

function text(vec, words, config={}) {
  const t = document.createElementNS(SVG_NS, 'text');
  t.innerHTML = words;
  t.style.zIndex = '1';

  return __ns(t, {
    ...config,
    x: vec.x, y: vec.y
  });
}

function polyline(points, config={}, cb) {
  const p = document.createElementNS(SVG_NS, 'polyline');
  p.addEventListener('mousemove', cb);

  return __ns(p, {
    points,
    ...config
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

  return [
    polyline(points, {
      'stroke': color,
      'fill': 'none',
    }),
    polyline(points, {
      'fill': 'none',
      'stroke': 'transparent',
      'stroke-width': 5
    })
  ];
}

function xaxis({leny, lenx, lb, ub, parts, label, grid}) {
  const partitions = [];
  let i, x_coord, xval;
  const margin = lenx / parts;
  const part_val = (ub-lb) / parts;

  /*
   * Rendering x-axis intervals and text for each interval
   */
  for (i=0; i<=parts; i++) {
    x_coord = RIGHT(START_X, OFFSET(margin, i));
    partitions.push(
      line(
        __vec(x_coord, DOWN(ORIGIN_Y, 5)),
        __vec(x_coord, UP(ORIGIN_Y, 5)),
        { 'stroke': 'black'}
        )
    );
    xval = ROUND(lb+SCALE_VAL(part_val, i));
    partitions.push(
      text(
        __vec(RIGHT(x_coord, 5), DOWN(ORIGIN_Y, 20)),
        xval, {'text-anchor': 'end'}
      )
    );

    if (grid && xval !== 0) {
      partitions.push(
        line(
          __vec(x_coord, UP(START_Y, 5)),
          __vec(x_coord, UP(START_Y, leny)),
          {
            'stroke': 'grey',
            'stroke-dasharray': '4,6'
          }
        )
      );
    }
  }

  return [
    text(__vec(
        RIGHT(START_X, HALF(lenx)), DOWN(START_Y, 50)
      ), label, {'text-anchor': 'end'}
    ),
    line(
      __vec(START_X, ORIGIN_Y),
      __vec(RIGHT(START_X, lenx), ORIGIN_Y),
      {'stroke': 'black'}
    ),
    ...partitions
  ];
}

function yaxis({leny, lenx, lb, ub, parts, label, grid}) {
  /* Re-adjust LENGTH_Y */
  leny = START_Y-leny < 0 ? START_Y : leny;

  let partitions = [];
  let i, y_coord, yval;
  const margin = leny / parts;
  const part_val = (ub-lb) / parts;

  /* Rendering y-axis intervals & text for each interval */
  for (i=0; i<=parts; i++) {
    y_coord = START_Y - OFFSET(margin, i);
    partitions.push(
      line(
        __vec(LEFT(ORIGIN_X,5), y_coord),
        __vec(RIGHT(ORIGIN_X,5), y_coord),
        {'stroke': 'black'}
      )
    );

    yval = lb + SCALE_VAL(part_val, i);
    let abs_yval = Math.abs(yval);
    yval = (abs_yval >= 1000) || (abs_yval <= 0.001 && abs_yval > 0)
      ? EXP(yval, 1)
      : FIXED(yval, 2);

    partitions.push(
      text(
        __vec(LEFT(ORIGIN_X,10), DOWN(y_coord,5)),
        yval, {'text-anchor': 'end'}
      )
    );

    if (grid && yval !== '0.00') {
      partitions.push(
        line(
          __vec(RIGHT(START_X,5), y_coord),
          __vec(RIGHT(START_X,lenx), y_coord),
          {
            'stroke': 'grey',
            'stroke-dasharray': '4,6'
          }
        )
      );
    }
  }

  return [
    text(__vec(
        LEFT(START_X, 60),
        UP(START_Y, DOWN(HALF(leny),40))
      ),
      label, {
        'style': 'text-orientation: sideways; writing-mode: vertical-lr;',
        'text-anchor': 'start'
      }
    ),
    line(
      __vec(ORIGIN_X, UP(START_Y,leny)),
      __vec(ORIGIN_X, START_Y),
      {'stroke': 'black'}
    ),
    ...partitions
  ]
}

function init_plot(lb, ub, plot_len, parts) {
  let new_lb = __ROUND(lb), new_ub = __ROUND(ub);
  let abs_lb = Math.abs(new_lb), abs_ub = Math.abs(new_ub);

  let u_parts = 0, l_parts = 0;
  if (ub === 0) {
    l_parts = parts;
  } else if (lb === 0) {
    u_parts = parts;
  } else {
    let t_ub = Math.abs(ub), t_lb = Math.abs(lb);
    let sum = (t_ub + t_lb);
    l_parts = Math.ceil(parts * (t_lb/sum));
    u_parts = Math.ceil(parts * (t_ub/sum));
  }

  /*
   * This is the most important part:
   *
   * Define a 'part' as a grid piece (gp), the space that is
   * between grid pieces is the interval needed to capture all
   * the points in the given plot (as determined by upper/lower
   * bounds)
   *
   * For instance: the grid interval needed to capture the
   * lower grid (y<0) is given by: new_lb/l_parts
   * Similarly, for upper grid (y>0) is given by: new_ub/u_parts
   *
   * Then, because each grid interval must be equal (with
   * exception to log-log graphs), we take the max interval b/w
   * the lower and upper bound intervals and set that as the
   * grid interval to be used.
   */
  let partition = Math.abs(l_parts !== 0
    ? new_lb/l_parts
    : new_ub/u_parts
  );
  u_parts = Math.ceil(abs_ub/partition);

  /*
   * Do some adjustments to the upper/lower bounds given the
   * appropriate grid interval calculated in the step above.
   * The principle here is to round up to the nearest multiple
   * of the partition. This multiple has to be at least the
   * size determined by l_parts*partition amount (since we
   * don't want to miss any necessary grid space)
   */
  let lb_ru = ROUND_UP(abs_lb, partition*l_parts);
  let ub_ru = ROUND_UP(abs_ub, partition*u_parts);
  new_lb-=(lb_ru-Math.abs(new_lb));
  new_ub+=(ub_ru-Math.abs(new_ub));

  const part_val = (new_ub-new_lb) / (l_parts+u_parts);
  parts = l_parts+u_parts;
  if (parts === Infinity) return;
  let i, val;
  for (i = 0; i <= parts; i++) {
    val = FIXED(new_lb + SCALE_VAL(part_val, i), 2);
    if (val === '0.00' || val === '-0.00') {
      return {
        lb: new_lb, ub: new_ub,
        offset: OFFSET(plot_len / parts, i),
        parts
      }
    }
  }
}

function init() {
  const SAMPLE_RATE = 100;
  let ygrid = 10;
  let xgrid = 10;
  let xlb = -10, xub = 5, ylb = 0, yub = 0;

  const parser = math.parser();
  parser.evaluate('f(x) = abs(x)*sin(x)');
  let points = [];
  let i=0, xval, yval;
  const sample_amt = (xub-xlb) / (xgrid*SAMPLE_RATE);
  for (xval=xlb; xval<xub; xval+=sample_amt) {
    yval = parser.evaluate(`f(${xval})`);
    if (!isNaN(yval)) {
      yub = MAX(yval, yub);
      ylb = MIN(yval, ylb);

      points.push({
        x: xval,
        y: yval
      });

      i++;
    }
  }
  ylb = ylb > 0 ? 0 : ylb*1.2;
  yub = yub < 0 ? 0 : yub*1.2;

  let x_offset, y_offset;
  ({
    lb: xlb, ub: xub, offset: x_offset, parts: xgrid
  } = init_plot(xlb, xub, LENGTH_X, xgrid));
  ({
    lb: ylb, ub: yub, offset: y_offset, parts: ygrid
  } = init_plot(ylb, yub, LENGTH_Y, ygrid));

  ORIGIN_X = RIGHT(START_X, x_offset);
  ORIGIN_Y = START_Y - y_offset;

  let _svg = svg('wrapper');

  /* plot */
  __ns(_svg,
    undefined,
    g('plot', ...plot(points, RATIO(LENGTH_X, xub-xlb),
      RATIO(LENGTH_Y, yub-ylb), 'blue')),
    g('x-axis', ...xaxis({
      leny: LENGTH_Y,
      lenx: LENGTH_X,
      lb: xlb,
      ub: xub,
      parts: xgrid,
      label: '',
      grid: false
    })),
    g('y-axis', ...yaxis({
      leny: LENGTH_Y,
      lenx: LENGTH_X,
      lb: ylb,
      ub: yub,
      parts: ygrid,
      label: '',
      grid: false
    })),
  );

  Svgraph().appendChild(_svg);
  Svgraph().addEventListener('mousemove', event => {
    let X = event.offsetX, Y = event.offsetY;
    if (Y > START_Y || Y < START_Y-LENGTH_Y
      || X > START_X+LENGTH_X || X < START_X) {
      return;
    }

    let _x = __X(X, xlb, xub)-xlb;
    let _xf = Math.floor(_x);
    let idx = Math.floor((_x-_xf)/sample_amt + _xf*SAMPLE_RATE);
    console.log(idx);
    console.log(_x, points[idx].x, points[idx].y);
    __Guide(ID_GUIDE_X,
      __vec(START_X, Y), __vec(RIGHT(START_X, LENGTH_X), Y)
    );
    __Guide(ID_GUIDE_Y,
      __vec(X, START_Y), __vec(X, UP(START_Y, LENGTH_Y))
    );
  });
}
