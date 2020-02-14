const SVG_NS = 'http://www.w3.org/2000/svg';
const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

const MIN_XGRID = 8, MIN_YGRID = 8, MIN_X = 1, MIN_Y = 1;
const MAX_XGRID = 15, MAX_YGRID = 15;
const MAX_LOG_XGRID = 5;
const SAMPLE_RATE = 10, SAMPLE_INTERVAL = 50; /* ms */
const HEIGHT_TRACE = 15, WIDTH_TRACE = 55;
const GRID_MODE = false;
const SEMI_LOG_MODE = true;
const START_X = 100, START_Y = 470;
const LENGTH_X = 600, LENGTH_Y = 400;
let ORIGIN_X = 100, ORIGIN_Y1 = 450, ORIGIN_Y2 = 450; /* These change depending on graph */
let AXIS_XPOS_1 = START_X;
let AXIS_XPOS_2 = START_X+LENGTH_X;

const ID_GRAPH_SVG = 'svg-graph';
const ID_GUIDE_X = 'x-guide';
const ID_GUIDE_Y = 'y-guide';
const ID_LEGEND = 'legend';

const LOG_LEVEL = 1;
const LOG_LEVELS = {debug: 4, info: 3, warn: 2, error: 1};

/* 'fake' macros */
const OFFSET = (margin, idx) => margin * idx;
const HALF = (v) => v/2;
const UP = (ref, offset) => ref-offset;
const DOWN = (ref, offset) => ref+offset;
const LEFT = (ref, offset) => ref-offset;
const RIGHT = (ref, offset) => ref+offset;
const SCALE = (v, r) => v * r;
const RATIO = (c1, c2) => c1 / c2;
const MAX = (s1, s2) => s1 > s2 ? s1 : s2;
const MIN = (s1, s2) => s1 < s2 ? s1 : s2;
const DELTA = (s1, s2) => Math.abs(s1-s2);
const ELEM = (id) => document.getElementById(id);
const APPROX = (num, ref, tol) => (num >= ref-tol) && (num <= ref+tol);
const CSS = (obj) => Object.entries(obj)
  .reduce((p, [k, v]) => `${p}${k}: ${v}; `, '').trim();
const RAND = (min, max) => Math.floor(Math.random() * (max - min) ) + min;
const RGB = (r, g, b) => `rgb(${r},${g},${b})`;
const DEFINED = (v) => (typeof v !== 'undefined') && (v !== null);
const INFINITY = (v) => Math.abs(v) === Infinity;
const RANGE = (n, l, u) => n >= l && n < u;

/* loggers */
const __LOG = (l, msg, ...p) => {
  if (LOG_LEVELS[l] <= LOG_LEVEL) {
    console.log(msg, ...p);
  }
};
const DEBUG = (msg, ...p) => __LOG('debug', msg, ...p);
const INFO = (msg, ...p) => __LOG('info', msg, ...p);
const WARN = (msg, ...p) => __LOG('warn', msg, ...p);
const ERROR = (msg, ...p) => __LOG('error', msg, ...p);

const COLORS = [
  RGB(0,128,255)  /* blue */,   RGB(255,0,128)  /* magenta */,
  RGB(255,0,0)    /* red */,    RGB(0,128,0)    /* dark green */,
  RGB(128,0,255)  /* violet */, RGB(64,128,128) /* teal */,
  RGB(255,128,64) /* orange */, RGB(128,128,0)  /* dark yellow */
];

const RAND_COLOR = () => RGB(RAND(0, 255), RAND(0, 255), RAND(0, 255));
const COLOR = (() => {
  let i = 0;
  /* Loop back to first color if runs out */
  return reset_i => {
    if (reset_i) {
      i = 0;
      return;
    }
    let _i = i;
    i = i+1 >= COLORS.length ? 0 : i+1;
    return COLORS[_i];
  }
})();

/* SVG grid related macros */
const __X = (x, xlb, xub) => (x-START_X)/RATIO(LENGTH_X, xub-xlb)+xlb;
const __Y = (y, ylb, yub) => (START_Y-y)/RATIO(LENGTH_Y, yub-ylb)+ylb;
const __gX = (x, ratio) => RIGHT(ORIGIN_X, SCALE(x, ratio));
const __gY = (y, ratio, ORIGIN) => UP(ORIGIN, SCALE(y, ratio));

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

const __Tracer = (tracerId, xval, yval, xratio, yratio, ylb) => {
  const tracer = ELEM(tracerId);
  const tracerRect = ELEM(`${tracerId}-rect`);
  const tracerTxt = ELEM(`${tracerId}-text`);
  const tracerCirc = ELEM(`${tracerId}-circle`);
  const gx = __gX(xval, xratio);
  const gy = MAX(
    MIN(__gY(yval-ylb, yratio, START_Y), START_Y),
    START_Y-LENGTH_Y
  );
  const coords = `(${FIXED(xval, 2)}, ${FIXED(yval, 2)})`;

  if (!tracer && !isNaN(yval)) {
    /*
     * For some strange reason, we can only append
     * children to <svg> elements, so that's what
     * is happening here.
     */
    let elems = [
      rect(__vec(gx, gy),
        WIDTH_TRACE, HEIGHT_TRACE, {
          id: `${tracerId}-rect`,
          stroke: 'grey',
          fill: 'white',
          'stroke-opacity': '0.3'
        }),
      text(__vec(
        RIGHT(gx, 5), DOWN(gy, 7)),
        coords, {
          id: `${tracerId}-text`,
          textLength: WIDTH_TRACE-5,
          style: CSS({
            'font-size': '9px',
            'font-weight': 'bold',
            padding: '5px',
          })
        }),
      circle(__vec(gx, gy), 3, {
        id: `${tracerId}-circle`,
        opacity: '0.5',
        fill: 'red'
      })
    ];

    Svgraph().appendChild(__ns(
      svg(tracerId), undefined, ...elems
    ));
  } else if (tracer && !isNaN(yval)) {
    __ns(tracerRect, {x: gx, y: gy});
    __ns(tracerTxt, {
      x: RIGHT(gx, 2), y: DOWN(gy, 10)
    });
    __ns(tracerCirc, {cx: gx, cy: gy});
    tracerTxt.innerHTML = coords;
  } else if (tracer) {
    tracer.removeChild(tracerRect);
    tracer.removeChild(tracerTxt);
    tracer.removeChild(tracerCirc);
    Svgraph().removeChild(tracer);
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
  Object.keys(config).forEach(k =>
    elem.setAttribute(k, config[k])
  );

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

function foreignObject(vec, w, h, config, ...children) {
  const f = document.createElementNS(SVG_NS, 'foreignObject');

  return __ns(f, {
    ...config,
    width: w, height: h,
    x: vec.x, y: vec.y,
  }, ...children);
}

function exponent(vec, base, exp) {
  const _math = document.createElementNS(MATHML_NS, 'math');
  const _msup = document.createElementNS(MATHML_NS,'msup');
  const base_mn = document.createElementNS(MATHML_NS,'mn');
  const exp_mn = document.createElementNS(MATHML_NS,'mn');
  base_mn.innerHTML = base;
  exp_mn.innerHTML = exp;
  _msup.appendChild(base_mn);
  _msup.appendChild(exp_mn);
  _math.appendChild(_msup);

  return foreignObject(vec, 40, 40,
    {style: CSS({'z-index': 10})},
    _math
  );
}

function text(vec, words, config={}) {
  const t = document.createElementNS(SVG_NS, 'text');
  if (typeof words === 'string') {
    t.innerHTML = words;
  } else {
    t.appendChild(words);
  }
  t.style.zIndex = '1';

  return __ns(t, {
    ...config,
    x: vec.x, y: vec.y
  });
}

function circle(vec, r, config={}) {
  const c = document.createElementNS(SVG_NS, 'circle');

  return __ns(c, {
    ...config,
    cx: vec.x, cy: vec.y, r
  });
}

function rect(vec, width, height, config={}) {
  const r = document.createElementNS(SVG_NS, 'rect');

  return __ns(r, {
    ...config,
    x: vec.x, y: vec.y,
    width, height
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

function plot(dp, x_cratio, y_cratio, color, ylb) {
  let points = '';
  let i;
  let x_coord, y_coord;
  let dp_e;
  for (i=0; i<dp.length; i++) {
    dp_e = dp[i];
    if (!isNaN(dp_e.y)) {
      x_coord = MIN(__gX(dp_e.x, x_cratio), START_X+LENGTH_X);
      y_coord = MIN(__gY(dp_e.y-ylb, y_cratio, START_Y), START_Y);

      points += `${x_coord},${y_coord}`;
      if (i+1 !== dp.length) {
        points += ' ';
      }
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
        __vec(x_coord, DOWN(ORIGIN_Y1, 5)),
        __vec(x_coord, UP(ORIGIN_Y1, 5)),
        {stroke: 'black'}
      )
    );
    xval = lb+SCALE(part_val, i);
    xval = Math.abs(xval) < 1 ? FIXED(xval, 1) : ROUND(xval);
    if (SEMI_LOG_MODE) {
      partitions.push(exponent(
        __vec(RIGHT(x_coord, -10), DOWN(ORIGIN_Y1, 5)),
        10, xval));
    } else {
      partitions.push(text(
        __vec(RIGHT(x_coord, 5), DOWN(ORIGIN_Y1, 20)),
        xval, {'text-anchor': 'end'})
      );
    }

    if (grid && xval !== 0) {
      partitions.push(
        line(
          __vec(x_coord, UP(START_Y, 5)),
          __vec(x_coord, UP(START_Y, leny)), {
            stroke: 'grey',
            'stroke-opacity': '0.3',
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
      __vec(START_X, ORIGIN_Y1),
      __vec(RIGHT(START_X, lenx), ORIGIN_Y1),
      {'stroke': 'black'}
    ),
    /*
     * Add rectangle and make transparent to help with
     * cursor pointer hover effect.
     */
    rect(__vec(
      START_X, UP(ORIGIN_Y1,5)),
      lenx, 10, {
        fill: 'transparent',
        style: CSS({cursor: 'pointer'})
      }),
    ...partitions
  ];
}

function yaxis({leny, lenx, AXIS_XPOS, lb, ub, parts,
                 label, grid}) {
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
        __vec(LEFT(AXIS_XPOS,5), y_coord),
        __vec(RIGHT(AXIS_XPOS,5), y_coord),
        {'stroke': 'black'}
      )
    );

    yval = lb + SCALE(part_val, i);
    let abs_yval = Math.abs(yval);
    yval = (abs_yval >= 1000) || (abs_yval <= 0.001 && abs_yval > 0)
      ? EXP(yval, 1)
      : FIXED(yval, 2);

    partitions.push(
      text(
        __vec(LEFT(AXIS_XPOS,10), DOWN(y_coord,5)),
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
            'stroke-opacity': '0.5',
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
        style: CSS({
          'text-orientation': 'sideways',
          'writing-mode': 'vertical-lr'
        }),
        'text-anchor': 'start'
      }
    ),
    line(
      __vec(AXIS_XPOS, UP(START_Y,leny)),
      __vec(AXIS_XPOS, START_Y), {
        id: 'y-axis-line',
        stroke: 'black',
      }
    ),
    /*
     * Add rectangle and make transparent to help with
     * cursor pointer hover effect.
     */
    rect(__vec(
      LEFT(AXIS_XPOS, 5), UP(START_Y,leny)),
      10, leny, {
        fill: 'transparent',
        style: CSS({cursor: 'pointer'})
      }),
    ...partitions
  ]
}

function legend(fpoints) {
  let width = 10, height = 50, rownum = 2;
  let fontsize = 14; // pixels

  let txt_elems = [], color_elems = [];

  let i, j, _i;
  let _fpoint, max_width = 0, inc_width;
  for (i=0; i<fpoints.length; i+=rownum) {
    /* Construct legend using row-major order */
    _i = MIN(i+rownum, fpoints.length);
    for (j=i; j<_i; j++) {
      _fpoint = fpoints[j];
      if (_fpoint.f.length > max_width) {
        max_width = _fpoint.f.length;
      }
      txt_elems.push(text(__vec(
        RIGHT(START_X, width), DOWN(10, 20+20*(j-i))
      ), _fpoint.f, {
        style: CSS({
          'color': _fpoint.color,
          'font-size': fontsize,
          'font-weight': 100
        })
      }));
    }

    /* Color pallet */
    inc_width = fontsize*(max_width*0.45);
    for (j=i; j<_i; j++) {
      _fpoint = fpoints[j];
      color_elems.push(rect(__vec(
        RIGHT(START_X, width+inc_width),
        DOWN(10, 10+20*(j-i))
        ), 30, fontsize, {
          fill: _fpoint.color,
          stroke: 'black'
        })
      );
    }

    /* Expand the row */
    width+=(inc_width+60);
    max_width = 0;
  }

  return [
    rect(__vec(START_X, 10), width, height, {
      'id': ID_LEGEND,
      'stroke': 'black',
      'stroke-width': '1px',
      'stroke-opacity': '0.5',
      'fill': 'transparent'
    }),
    ...txt_elems,
    ...color_elems
  ];
}

function init_plot(lb, ub, plot_len, parts,is_init=false,
                   seed_offset=0) {
  lb = ROUND_UP(lb, 5);
  ub = ROUND_UP(ub, 5);

  INFO(`lb: ${lb}, ub: ${ub}`);
  if (lb === ub) {
    return {
      lb: lb-5, ub: ub+5,
      offset: seed_offset, parts
    }
  }

  lb = __ROUND(lb); ub = __ROUND(ub);
  let new_lb = lb, new_ub = ub;
  let abs_lb = Math.abs(new_lb), abs_ub = Math.abs(new_ub);

  let u_parts = 0, l_parts = 0;
  if (ub === 0) {
    l_parts = parts;
  } else if (lb === 0) {
    u_parts = parts;
  } else {
    let t_ub = Math.abs(ub), t_lb = Math.abs(lb);
    u_parts = Math.ceil(parts*(t_ub/(t_ub+t_lb)));
    l_parts = parts-u_parts;
  }

  INFO(`====BEFORE=====`);
  INFO(`parts: ${parts} -> (l=${l_parts}, u=${u_parts})`);
  INFO(`lb: ${lb}, ub: ${ub}`);

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
  if (is_init) {
    let lb_ru = ROUND_UP(abs_lb, partition*l_parts);
    let ub_ru = ROUND_UP(abs_ub, partition*u_parts);
    new_lb -= (lb_ru - Math.abs(new_lb));
    new_ub += (ub_ru - Math.abs(new_ub));
  }

  parts = l_parts+u_parts;

  INFO(`partition: ${partition}`);
  INFO(`lparts: ${l_parts}, uparts: ${u_parts}`);
  INFO(`new_lb: ${new_lb}, new_ub: ${new_ub}`);
  INFO('=======AFTER========');

  if (parts === Infinity) {
    ERROR('error: parts is infinity');
    throw new Error('No matched parts');
  }

  let i, val, offset;
  let px_per_partition = plot_len/parts;
  for (i = 0; i <= parts; i++) {
    val = FIXED(new_lb+SCALE(partition, i), 2);
    DEBUG(`VALUE: ${val}`);
    if (val === '0.00' || val === '-0.00') {
      offset = OFFSET(plot_len/parts, i);
      INFO(`current offset: ${offset}`);

      /*
       * If the offset is seeded from a previous plot, we
       * adjust the current offset
       */
      if (seed_offset) {
        let p = __ROUND(RATIO(offset-seed_offset,
          px_per_partition));

        new_ub+=(p*partition);
        new_lb+=(p*partition);
        INFO(`ub: ${new_ub}, lb: ${new_lb}`);
      }

      return {
        lb: new_lb, ub: new_ub,
        offset: offset,
        parts
      }
    }
  }
}

function eval_log(funcs, xgrid, xlb, xub, ylb, yub, is_init=false) {
  let sample_amt = 1;

  /*
   * Here is the log-scale conversion -> we need to evaluate
   * each function at f(x) for x = {1,2,3,..,10,20,30,..,},
   * then plot it on a log axis with the mapping described
   * as below:
   *
   * x | log(x)  x  | log(x)   x   | log(x)
   * ----------------------------------------
   * 1 |   0     10 |    1    100 |    2
   * 2 |  0.301  20 |  1.301  200 |  2.301
   * 3 |  0.477  30 |  1.477  300 |  2.477
   * 4 |  0.602  40 |  1.602  400 |  2.602
   * 5 |  0.699  50 |  1.699  500 |  2.699
   * 6 |  0.778  60 |  1.778  600 |  2.778
   * 7 |  0.845  70 |  1.845  700 |  2.845
   * 8 |  0.903  80 |  1.903  800 |  2.903
   * 9 |  0.954  90 |  1.954  900 |  2.954
   *
   * The pattern is clear: each decade in increase for
   * x reflects in an increment in log(x).
   *
   * We can leverage this pattern to make computing the
   * samples faster. First, we take only 10 samples per
   * decade (order of magnitude). While the number of samples
   * can be modulated depending on values of xlb, xub, it
   * is sufficient for now to keep it fixed at 10.
   *
   * Second, rather than computing log(x) for every x to
   * determine where along the axis each sample should
   * be placed, we can, for each decade, add fixed pre-
   * computed amounts onto the base value of the decade.
   */
  let logdist = [
    0,
    0.301,
    0.477,
    0.602,
    0.699,
    0.778,
    0.845,
    0.903,
    0.954
  ];
  let fpoints;

  /*
   * xlb: lower bound log(x)
   * xub: upper bound log(x)
   */
  xlb = 0;
  xub = MIN(xgrid, MAX_LOG_XGRID);

  let points;
  const parser = math.parser();
  fpoints = funcs.map(f => {
    parser.evaluate(f);

    points = [];
    let xval, yval, x_base = 1, x_incr = 1;
    for (xval=xlb; xval<=xub; xval++) {
      let i, xlog;
      for (i=0; i<logdist.length; i++) {
        xlog = xval+logdist[i];
        yval = parser.evaluate(`f(${x_base+(x_incr*i)})`);
        if (!isNaN(yval) && !INFINITY(yval)) {
          yub = MAX(yval, yub);
          ylb = MIN(yval, ylb);

          points.push(__vec(xlog, yval));
        } else {
          points.push(__vec(xlog, NaN));
        }
      }

      x_base*=10;
      x_incr*=10;
    }

    return {f, points, color: COLOR()};
  });

  return {fpoints, sample_amt,
    xub, xlb, yub, ylb};
}

function eval(funcs, xgrid, xlb, xub, ylb, yub, is_init=false) {
  let sample_amt, fpoints;

  if (SEMI_LOG_MODE) {
    return eval_log(funcs, xgrid, xlb, xub,
      ylb, yub, is_init);
  }

  /*
   * fpoints  : stores the sample points to plot on the graph.
   * xub      : x_upper_bound
   * xlb      : x_lower_bound
   * xgrid    : how many grid pieces there are
   * SAMPLE_RATE : number of samples per grid piece
   *
   * sample_amt : the interval b/w 2 samples of f(x) e.g.
   * Say the bounds were from -2 to 2 (xlb=-2, xub=2),
   * SAMPLE_RATE=1 (1 sample per grid piece), and # of
   * grid pieces in x is 4, then:
   *
   * sample_amt = 2-(-2) / (4*1) = 1
   *
   * In other words: 1 sample per grid piece So we would
   * sample at x = {-2, -1, 0, 1, 2}
   *
   * In this function, for each function to be rendered,
   * calculate the points based on the described params.
   */
  const parser = math.parser();
  sample_amt = (xub-xlb) / (xgrid*SAMPLE_RATE);
  fpoints = funcs.map(f => {
    parser.evaluate(f);
    let points = [];
    let xval, yval;
    for (xval=xlb; xval<=xub; xval+=sample_amt) {
      yval = parser.evaluate(`f(${xval})`);
      if (!isNaN(yval) || INFINITY(yval)) {
        yub = MAX(yval, yub);
        ylb = MIN(yval, ylb);

        points.push(__vec(xval, yval));
      } else {
        points.push(__vec(xval, NaN));
      }
    }
    return {f, points, color: COLOR()};
  });

  return {fpoints, sample_amt,
    xub, xlb, yub, ylb};
}

function render(config, changeSet, funcs1, funcs2, xlb, xub,
                ylb1, yub1, ylb2, yub2,
                xgrid, ygrid1, ygrid2,
                sample_amt1, sample_amt2,
                fpoints1, fpoints2) {
  if (changeSet) {
    DEBUG(`========START CONFIG==========`);
    DEBUG(`BEFORE: ylb: ${ylb1}, yub: ${yub1}`);
    COLOR(true);
    let {x_axis, left_y_axis, right_y_axis} = config;
    let {xm, ym1, ym2} = changeSet;
    let x_changed=false, y1_changed=false, y2_changed=false;

    if (!x_axis.fixed) {
      xgrid = MIN(MAX(xgrid+xm, MIN_XGRID), MAX_XGRID);
      xlb = MIN(xlb-xm, -MIN_X);
      xub = MAX(xub+xm, MIN_X);
      x_changed = true;
    }
    if (!left_y_axis.fixed) {
      ygrid1 = MIN(MAX(ygrid1+ym1, MIN_YGRID), MAX_YGRID);
      ylb1 = MIN(ylb1-ym1, -MIN_Y);
      yub1 = MAX(yub1+ym1, MIN_Y);
      y1_changed = true;
    }
    if (!right_y_axis.fixed) {
      ygrid2 = MIN(MAX(ygrid2+ym2, MIN_YGRID), MAX_YGRID);
      ylb2 = MIN(ylb2-ym2, -MIN_Y);
      yub2 = MAX(yub2+ym2, MIN_Y);
      y2_changed = true;
    }
    DEBUG(`AFTER: ylb: ${ylb1}, yub: ${yub1}`);
    DEBUG(`========END CONFIG==========`);
    if (!y1_changed && !y2_changed && !x_changed) {
      return {
        xlb, xub, ylb1, yub1, ylb2, yub2,
        xgrid, ygrid1, ygrid2,
        sample_amt1, sample_amt2, fpoints1, fpoints2
      };
    }
  }

  if (funcs1.length !== 0) {
    ({
      fpoints: fpoints1, sample_amt: sample_amt1,
      xlb, xub, ylb: ylb1, yub: yub1
    } = eval(funcs1, xgrid, xlb, xub, ylb1, yub1,
      !DEFINED(changeSet)));
  } else {
    fpoints1 = [];
  }

  if (funcs2.length !== 0) {
    ({
      fpoints: fpoints2, sample_amt: sample_amt2,
      xlb, xub, ylb: ylb2, yub: yub2
    } = eval(funcs2, xgrid, xlb, xub, ylb2, yub2,
      !DEFINED(changeSet)));
  } else {
    fpoints2 = [];
  }

  let x_offset, y_offset1, y_offset2;
  try {
    ({
      lb: xlb,
      ub: xub,
      offset: x_offset,
      parts: xgrid
    } = init_plot(xlb, xub, LENGTH_X, xgrid,
      !DEFINED(changeSet)));
    if (funcs1.length !== 0) {
      ({
        lb: ylb1,
        ub: yub1,
        offset: y_offset1,
        parts: ygrid1
      } = init_plot(ylb1, yub1, LENGTH_Y, ygrid1,
        !DEFINED(changeSet)));
    } else {
      ({
        lb: ylb2,
        ub: yub2,
        offset: y_offset2,
        parts: ygrid2
      } = init_plot(ylb2, yub2, LENGTH_Y, ygrid2,
        !DEFINED(changeSet), y_offset1));
    }
    let wrapper = ELEM('wrapper');
    if (wrapper) {
      Svgraph().removeChild(ELEM('wrapper'));
    }
  } catch (err) {
    return {
      xlb, xub, ylb1, yub1, ylb2, yub2,
      xgrid, ygrid1, ygrid2,
      sample_amt1, sample_amt2, fpoints1, fpoints2
    };
  }

  ORIGIN_X = RIGHT(START_X, x_offset);
  if (!y_offset1) {
    y_offset1 = __ROUND(START_Y/2);
  }
  ORIGIN_Y1 = UP(START_Y, y_offset1);
  ORIGIN_Y2 = ORIGIN_Y1;

  let _svg = svg('wrapper');

  INFO(`yub1: ${yub1}, ylb1: ${ylb1}`);
  /* plot */
  __ns(_svg,
    undefined,
    ...fpoints1.map(({points, color}) => g(
      'plot', ...plot(points,
        RATIO(LENGTH_X, xub-xlb),
        RATIO(LENGTH_Y, yub1-ylb1), color,
        ylb1)
    )),
    ...fpoints2.map(({points, color}) => g(
      'plot', ...plot(points,
        RATIO(LENGTH_X, xub-xlb),
        RATIO(LENGTH_Y, yub2-ylb2), color,
        ylb2)
    )),
    g('x-axis', ...xaxis({
      leny: LENGTH_Y,
      lenx: LENGTH_X,
      lb: xlb,
      ub: xub,
      parts: xgrid,
      label: '',
      grid: GRID_MODE
    })),
    g('y-axis-1', ...yaxis({
      leny: LENGTH_Y,
      lenx: LENGTH_X,
      AXIS_XPOS: AXIS_XPOS_1,
      lb: ylb1,
      ub: yub1,
      parts: ygrid1,
      label: '|f(jw)| (dB)',
      grid: GRID_MODE
    })),
    g('y-axis-2', ...yaxis({
      leny: LENGTH_Y,
      lenx: LENGTH_X,
      AXIS_XPOS: AXIS_XPOS_2,
      lb: ylb2,
      ub: yub2,
      parts: ygrid2,
      label: '<f(jw) (deg)',
      grid: GRID_MODE
    })),
  );

  Svgraph().appendChild(_svg);

  return {
    xlb, xub, ylb1, yub1, ylb2, yub2,
    xgrid, ygrid1, ygrid2,
    sample_amt1, sample_amt2, fpoints1, fpoints2
  };
}

function init(config) {
  /*
   * These variables are the core rendering components:
   * [x/y]lb    : Lower-bound value for x/y-axis (actual)
   * [x/y]ub    : Upper-bound value for x/y-axis (actual)
   * [x/y]grid  : Approx. # of grid intervals for x-axis
   * sample_amt : Actual x-value interval b/w each sample.
   *              e.g. f(x) = x taken at sample_amt=0.2
   *                   with xlb=-1, xub=1 would be sampled at:
   *                   x=[-1,-0.8,-0.6,-0.4,-0.2, ..., 1]
   * fpoints    : Main data structure - each elem contains 'y'
   *              values for each sample for each function
   */
  let {left_y_axis, right_y_axis, x_axis} = config;

  let xlb=x_axis.lb, xub=x_axis.ub;
  let ylb1=left_y_axis.lb, yub1=left_y_axis.ub;
  let ylb2=right_y_axis.lb, yub2=right_y_axis.ub;
  let ygrid1=left_y_axis.num_grids, ygrid2=right_y_axis.num_grids;
  let xgrid = x_axis.num_grids;

  let sample_amt1, sample_amt2, fpoints1, fpoints2;
  const axis1_funcs = [], axis2_funcs = [];

  /* =========== first time render =========== */
  ({
    xlb, xub, ylb1, yub1, ylb2, yub2,
    xgrid, ygrid1, ygrid2,
    sample_amt1, sample_amt2, fpoints1, fpoints2
  } = render(config, undefined, [], [],
    xlb, xub, ylb1, yub1, ylb2, yub2,
    xgrid, ygrid1, ygrid2,
    sample_amt1, sample_amt2,
    fpoints1, fpoints2));

  /*
   * This event is triggered upon every mouse move action
   * within the SVG element. Used to handle all dynamic
   * graph renders. See implementation below for details.
   */
  let X, Y;
  Svgraph().addEventListener('mousemove', event => {
    X = event.offsetX; Y = event.offsetY;
    if (Y > START_Y || Y < START_Y-LENGTH_Y
      || X > START_X+LENGTH_X || X < START_X) {
      return;
    }

    /*
     * Formula for getting 'points' array index from cursor
     * coordinates. Basic idea is to find the X-AXIS value,
     * then translate that into the number of iterations in
     * the generation loop (see above) it took for 'xval' to
     * be the current X-AXIS value -> __X(X, xlb, xub).
     */
    const tracer_guide = (id, fpoints, ORIGIN, ylb, yub,
                          sample_amt) => {
      let idx;
      if (!SEMI_LOG_MODE) {
        idx = RATIO(__X(X, xlb, xub) - xlb, sample_amt);
      } else {
        let _x, _base, _d, _add=0;

        _x = __X(X, xlb, xub);
        _base = Math.floor(_x);
        _d = _x - _base;

        /*
         * Same ranges used in eval_log(), see that for
         * more detailed explanation.
         */
        if (RANGE(_d, 0.1, 0.301))
          _add = 1;
        else if (RANGE(_d, 0.301, 0.477))
          _add = 2;
        else if (RANGE(_d, 0.477, 0.602))
          _add = 3;
        else if (RANGE(_d, 0.602, 0.699))
          _add = 4;
        else if (RANGE(_d, 0.699, 0.778))
          _add = 5;
        else if (RANGE(_d, 0.778, 0.845))
          _add = 6;
        else if (RANGE(_d, 0.845, 0.903))
          _add = 7;
        else if (RANGE(_d, 0.903, 0.945))
          _add = 8;
        else if (RANGE(_d, 0.945, 1))
          _add = 9;

        /*
         * The *9 is because there are 9 values stored per
         * grid interval. So the formula comes down to:
         * idx = (# spaces in interval)*(# intervals) + (offset spaces)
         */
        idx = 9*_base + _add;
      }

      if (FIXED(idx%1, 1) === '0.0') {
        idx = Math.floor(idx);

        __Guide(ID_GUIDE_X, __vec(START_X, Y),
          __vec(RIGHT(START_X, LENGTH_X), Y)
        );
        __Guide(ID_GUIDE_Y, __vec(X, START_Y),
          __vec(X, UP(START_Y, LENGTH_Y))
        );

        /*
         * For each plot, draw out their own locations. This
         * creates a new tracer for each new plot that is
         * present on the graph and refreshes based on a fixed
         * ID convention.
         */
        fpoints.forEach(({points}, i) => {
          let vec = points[idx];
          if (DEFINED(vec)) {
            __Tracer(`tracer-${id}-${i}`,
              vec.x, vec.y,
              RATIO(LENGTH_X, xub - xlb),
              RATIO(LENGTH_Y, yub - ylb),
              ylb
            );
          }
        });
      }
    };

    tracer_guide('ORIGIN_Y1', fpoints1, ORIGIN_Y1,
      ylb1, yub1, sample_amt1);
    tracer_guide('ORIGIN_Y2', fpoints2,
      ORIGIN_Y2, ylb2, yub2, sample_amt2);
  });

  let intervalId = 0;
  Svgraph().addEventListener('mousedown', event => {
    X = event.offsetX; Y = event.offsetY;
    if (Y > START_Y || Y < START_Y-LENGTH_Y
      || X > START_X+LENGTH_X || X < START_X) {
      return;
    }
    const cb_setup = (xory, y1ory2) => {
      return (X, Y, oldX, oldY) => {
        let ylb = y1ory2 ? ylb1 : ylb2;
        let yub = y1ory2 ? yub1 : yub2;

        if (X === oldX && Y === oldY)
          return {xm: 0, ym1: 0, ym2: 0};

        DEBUG('=======CB_SETUP=======');
        DEBUG(`(${X},${Y}) | OLD:(${oldX},${oldY})`);
        let x_offset=0, y_offset=0;
        if (xory) { /* X-axis */
          if (DELTA(X, oldX) > 5) {
            x_offset = 2;
            if (Math.abs(__X(oldX, xlb, xub)) <
              Math.abs(__X(X, xlb, xub))) {
              x_offset *= -1;
            }
          }
        } else { /* Y-axis */
          if (DELTA(Y, oldY) > 5) {
            y_offset = 2;
            if (Math.abs(__Y(oldY, ylb, yub)) <
              Math.abs(__Y(Y, ylb, yub))) {
              y_offset *= -1;
            }
          }
        }
        DEBUG(`OFFSET: (${x_offset},${y_offset})`);
        DEBUG('=======END CB_SETUP=======');
        return {
          xm: x_offset,
          ym1: y1ory2 ? y_offset : 0,
          ym2: y1ory2 ? 0 : y_offset
        };
      }
    };

    let cb = undefined;
    if (APPROX(Y, ORIGIN_Y1, 5)) { /* X-axis */
      cb = cb_setup(true, true);
    } else if (APPROX(X, AXIS_XPOS_1, 5)) { /* Y-axis 1 */
      cb = cb_setup(false, true);
    } else if (APPROX(X, AXIS_XPOS_2, 5)) { /* Y-axis 2 */
      cb = cb_setup(false, false);
    }

    if (!DEFINED(cb) || intervalId !== 0) {
      return;
    }

    let _X = X, _Y = Y;
    intervalId = setInterval(() => {
      if (Y > START_Y || Y < START_Y-LENGTH_Y
        || X > START_X+LENGTH_X || X < START_X) {
        clearInterval(intervalId);
        intervalId = 0;
        return;
      }

      let c = cb(X, Y, _X, _Y);
      _X = X; _Y = Y;

      /*
       * Re-render with update to x/y components.
       * Render returns the updated copies of every
       * core component, so we reassign them to keep
       * up to date.
       */
      if (c.xm !== 0 || c.ym1 !== 0 || c.ym2 !== 0) {
        ({
          xlb, xub, ylb1, yub1, ylb2, yub2,
          xgrid, ygrid1, ygrid2,
          sample_amt1, sample_amt2, fpoints1, fpoints2
        } = render(config, c, axis1_funcs, axis2_funcs,
          xlb, xub, ylb1, yub1, ylb2, yub2,
          xgrid, ygrid1, ygrid2,
          sample_amt1, sample_amt2,
          fpoints1, fpoints2)
        );
      }
    }, SAMPLE_INTERVAL);
  });

  Svgraph().addEventListener('mouseup', () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = 0;
    }
  });

  return {
    update(left_funcs, right_funcs) {
      /* =========== Update render =========== */
      ({
        xlb, xub, ylb1, yub1, ylb2, yub2,
        xgrid, ygrid1, ygrid2,
        sample_amt1, sample_amt2, fpoints1, fpoints2
      } = render(config, undefined, left_funcs, right_funcs,
        xlb, xub, ylb1, yub1, ylb2, yub2,
        xgrid, ygrid1, ygrid2,
        sample_amt1, sample_amt2,
        fpoints1, fpoints2));

      Svgraph().appendChild(g('legend',
        ...legend([...fpoints1, ...fpoints2])
      ));
    }
  }
}
