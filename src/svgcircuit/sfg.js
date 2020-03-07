const SVG_NS = 'http://www.w3.org/2000/svg';
const ID_SFG = 'svg-sfg';
const SZ_CIRCLE_RADIUS = 5;
const BEZIER_SAMPLE_RATE = 200;

/* Fake macros */
const ELEM = (id) => document.getElementById(id);
const AVG = arr => arr.reduce((total, e) => total+e)/arr.length;
const CENTER = vecs => __vec(AVG(vecs.map(v => v.x)), AVG(vecs.map(v => v.y)));
const SHIFT = (v, s) => __vec(v.x+s.x, v.y+s.y);
const MAG = v => Math.sqrt(Math.pow(v.x,2)+Math.pow(v.y,2));
const NORM = v => __vec(v.x/MAG(v), v.y/MAG(v));
const MULT = (v, scalar) => __vec(v.x*scalar, v.y*scalar);
const MULT_X = (v, scalar) => __vec(v.x*scalar, v.y);
const MULT_Y = (v, scalar) => __vec(v.x, v.y*scalar);
const DOT = (v1, v2) => v1.x*v2.x + v1.y*v2.y;
const DET = (v1, v2) => v1.x*v2.y - v1.y*v2.x;
const SUB = (v1, v2) => __vec(v1.x-v2.x, v1.y-v2.y);
const ADD = (v1, v2) => __vec(v1.x+v2.x, v1.y+v2.y);
const DEFINED = (v) => (typeof v !== 'undefined') && (v !== null);
const CW_ANGLE = (v1, v2) => {
  /* https://stackoverflow.com/questions/14066933/direct-way-of-computing-clockwise-angle-between-2-vectors */
  let n_v1 = NORM(v1), n_v2 = NORM(v2);

  let dot = DOT(n_v1, n_v2);
  let det = DET(n_v1, n_v2);
  return Math.atan2(det, dot);
};
const VECS_TO_POINTS = vecs => vecs.reduce((aggr, v) => aggr+=`${v.x},${v.y} `, '');

function getSFG() {
  return document.getElementById(ID_SFG);
}

function __ns(elem, config={}, ...children) {
  Object.keys(config).forEach(k => {
    elem.setAttribute(k, config[k])
  });

  if (children) {
    children.forEach(child => elem.appendChild(child));
  }

  return elem;
}

function __vec(x, y) {
  return {x, y};
}

function circle(vec, r, config={}) {
  const c = document.createElementNS(SVG_NS, 'circle');

  return __ns(c, {
    ...config,
    cx: vec.x,
    cy: vec.y,
    r
  });
}

function polygon(points, config={}) {
  const p = document.createElementNS(SVG_NS, 'polygon');

  return __ns(p, {
    ...config,
    points
  });
}

function polyline(points, config={}) {
  const p = document.createElementNS(SVG_NS, 'polyline');

  return __ns(p, {
    points,
    ...config
  });
}

function line(vecf, vect, config={}) {
  const l = document.createElementNS(SVG_NS, 'line');
  l.style.zIndex = '1';

  return __ns(l, {
    ...config,
    x1: vecf.x,
    y1: vecf.y,
    x2: vect.x,
    y2: vect.y
  });
}

function discrete_tan(vecs, i) {
  if (vecs.length === 1 || i === 0
    || i === vecs.length-1) {
    console.log('cannot calculate discrete tan');
    return __vec(0,0);
  }

  /*
   * Calculates the discrete tangent of a curve
   * described by an array of points at a point
   * p (which is also a vector) which can be indexed
   * using vecs[i].
   */
  let p = vecs[i];

  let t1 = SUB(p, vecs[i-1]);
  let t2 = SUB(vecs[i+1], p);

  return __vec((t1.x+t2.x)/2, (t1.y+t2.y)/2);
}

function _bezier_(len) {
  let P = [
    __vec(0,0), __vec(-0.5,2), __vec(2,2),
    __vec(3,0.5), __vec(3.5,2), __vec(4,0)
  ];
  const X_LOWER = P[0].x;
  const X_UPPER = P[P.length-1].x;

  /* Recursive inner function */
  const bezier = (i, ...Q) => {
    if (!Q.length) return;

    let _Q = [];

    let q_n, v, len;
    let n;
    for (n=0; n<Q.length-1; n++) {
      v = SUB(Q[n+1], Q[n]);
      len = MAG(v);
      q_n = ADD(
        MULT(NORM(v), (len/BEZIER_SAMPLE_RATE)*i),
        Q[n]
      );

      _Q.push(q_n);
    }

    /* Base case */
    if (_Q.length === 1) {
      return _Q[0];
    }

    return bezier(i, ..._Q);
  };

  let vecs = [];
  let i;
  for (i=0; i<=BEZIER_SAMPLE_RATE; i++) {
    vecs.push(bezier(i, ...P));
  }

  /*
   * (1) Translate all vecs so the starting point is
   *     at coordinate space (0,0).
   *     Note: y-value in each vec remains the same,
   *     translation only concerns the x-value.
   * (2) Scale vecs so it fits in the coordinate space.
   *     This is the transformation from BEZIER space
   *     to coordinate space.
   */
  console.log(VECS_TO_POINTS(vecs));
  vecs = trans(vecs, __vec(0-X_LOWER, 0));
  vecs = scale(vecs, __vec(len/(X_UPPER-X_LOWER), 40));

  return vecs;
}

function _approx_curve_(len) {
  const BEZIER = 'f(x) = 3(1-x)*x^2';
  const X_LOWER = 0;
  const X_UPPER = 1;

  let vecs = [];

  /*
   * Take samples in the math space of the BEZIER
   * function. These points will be stored as vecs
   * for later translation.
   *
   * Later steps takes vecs from BEZIER space and
   * transforms it into coordinate space where it
   * can be visualized on the SVG canvas.
   */
  const parser = math.parser();
  parser.evaluate(BEZIER);
  let sample_amt = 1/BEZIER_SAMPLE_RATE;
  let xval, yval;
  for (xval=X_LOWER; xval<=X_UPPER; xval+=sample_amt) {
    yval = parser.evaluate(`f(${xval})`);
    vecs.push(__vec(xval, yval));
  }

  /*
   * Fix-up: might not be exactly divisible by
   * BEZIER_SAMPLE_RATE which results in a "gaps" in
   * the vecs. If this is the case, simply evaluate
   * BEZIER at X_UPPER to seal up this gap.
   */
  if (xval-sample_amt < X_UPPER) {
    yval = parser.evaluate(`f(${X_UPPER})`);
    vecs.push(__vec(xval, yval));
  }

  /*
   * (1) Translate all vecs so the starting point is
   *     at coordinate space (0,0).
   *     Note: y-value in each vec remains the same,
   *     translation only concerns the x-value.
   * (2) Scale vecs so it fits in the coordinate space.
   *     This is the transformation from BEZIER space
   *     to coordinate space.
   */
  console.log(VECS_TO_POINTS(vecs));
  vecs = trans(vecs, __vec(0-X_LOWER, 0));
  vecs = scale(vecs, __vec(len/(X_UPPER-X_LOWER), 70));

  return vecs;
}

function _arrow_() {
  let points = [
    __vec(16,16), __vec(24,19), __vec(32,22),
    __vec(26,16), __vec(32,10), __vec(24,13),
    __vec(16,16)
  ];

  let shift = CENTER(points);
  shift.x = -shift.x;
  shift.y = -shift.y;

  return trans(points, shift);
}

function trans(vecs, vec_trans) {
  let i;
  for (i=0; i<vecs.length; i++) {
    vecs[i] = SHIFT(vecs[i], vec_trans);
  }

  return vecs;
}

function scale(vecs, vec_scale) {
  let i, v;
  for (i=0; i<vecs.length; i++) {
    v = vecs[i];
    vecs[i] = MULT_Y(MULT_X(v, vec_scale.x), vec_scale.y);
  }

  return vecs;
}

function rot(vecs, theta) {
  let x_a, y_a, x_b, y_b;
  let i, v;
  for (i=0; i<vecs.length; i++) {
    v = vecs[i];
    x_a = v.x;
    y_a = v.y;

    x_b = x_a*Math.cos(theta) - y_a*Math.sin(theta);
    y_b = y_a*Math.cos(theta) + x_a*Math.sin(theta);

    vecs[i] = __vec(x_b, y_b);
  }

  return vecs;
}

function render(V, E) {
  const nodes = Object.values(V).map(v => {
    return circle(v.vec, SZ_CIRCLE_RADIUS, {
        fill: 'transparent',
        stroke: 'black',
        'stroke-width': 1
      });
  });

  let edges = [];
  {
    let E_v = Object.values(E);
    let arrow;
    let v_from, v_to;
    let i, e;
    for (i=0; i<E_v.length; i++) {
      e = E_v[i];

      v_from = V[e.from].vec;
      v_to = V[e.to].vec;

      /*
       * Make v_from/v_to start/end outside of the
       * vertex.
       */
      let fuzzy_v = MULT(NORM(SUB(v_to, v_from)),
        SZ_CIRCLE_RADIUS);
      v_from = ADD(v_from, fuzzy_v);
      v_to = SUB(v_to, fuzzy_v);

      /*
       * Use an approximated BEZIER curve to get
       * straight/curve edges.
       * (1) Rotate edge CW by theta
       * (2) Translate edge so it connects with the nodes
       */
      let b_theta = CW_ANGLE(__vec(10, 0), SUB(v_to, v_from));

      let bezier = _bezier_(MAG(SUB(v_to, v_from)));
      bezier = rot(bezier, b_theta);
      bezier = trans(bezier, v_from);
      let green = 0, green_inc = 255/bezier.length;
      bezier.forEach(bv => {
        edges.push(circle(bv, 1, {
          fill: `rgb(255,${green},0)`
        }));
        green+=green_inc;
      });
      edges.push(polyline(VECS_TO_POINTS(bezier),
        {
          stroke: 'black',
          fill: 'none',
          'stroke-width': 0.5
        }
      ));

      /*
       * Find counter-clockwise angle between edge
       * vector and the x-axis vector (as a reference).
       * (1) Rotate arrow CW by theta
       * (2) Translate arrow to center of edge
       */
      let tan_v = discrete_tan(bezier, Math.floor(bezier.length/2));
      let a_theta = CW_ANGLE(__vec(-10, 0), tan_v);
      arrow = _arrow_();
      arrow = rot(arrow, a_theta);
      arrow = trans(arrow, bezier[Math.floor(bezier.length/2)]);
      edges.push(polygon(
        VECS_TO_POINTS(arrow),
        {fill: 'black'}
      ));
    }
  }

  __ns(getSFG(), {},
    ...nodes,
    ...edges
  );
}

function init(sfg) {
  let V = {}, E = {};
  {
    let i, v;
    for (i=0; i<sfg.length; i++) {
      v = sfg[i];

      if (!V.hasOwnProperty(v.id)) {
        V[v.id] = {
          id: v.id,
          value: v.value,
          edges: v.outgoingEdges.map(adj_e => adj_e.id),
          adj: v.outgoingEdges.map(adj_e => {
            if (adj_e.startNode === v.id) {
              return adj_e.endNode;
            } else {
              return adj_e.startNode;
            }
          }),
          vec: __vec(v.x, v.y)
        };
      }

      v.outgoingEdges.forEach(e => {
        if (!E.hasOwnProperty(e.id)) {
          E[e.id] = {
            id: e.id,
            weight: e.weight,
            from: e.startNode,
            to: e.endNode
          };
        }
      });
    }
  }

  render(V, E);
}

function visualize_bezier() {
  const colors = ['grey', 'blue', 'green', 'orange', 'purple'];
  let P = [
    __vec(0,0), __vec(-0.5,2), __vec(2,2),
    __vec(3,0.5), __vec(3.5,2), __vec(4,0)
  ];
  P = scale(P, __vec(50, 50));
  P = trans(P, __vec(500, 100));

  /* Recursive inner function */
  const bezier = (depth, i, ...Q) => {
    if (!Q.length) return;

    let _Q = [];
    let _Q_svg = [];

    let q_n, v, len;
    let n;
    for (n=0; n<Q.length-1; n++) {
      let c_dn1 = ELEM(`circle-${depth}-${n}`);
      let c_dn2 = ELEM(`circle-${depth}-${n+1}`);
      let l_dn = ELEM(`line-${depth}-${n}`);
      if (DEFINED(c_dn1)) {
        getSFG().removeChild(c_dn1);
      }
      if (DEFINED(c_dn2)) {
        getSFG().removeChild(c_dn2);
      }
      if (DEFINED(l_dn)) {
        getSFG().removeChild(l_dn);
      }

      _Q_svg.push(circle((Q[n]), 2, {
        id: `circle-${depth}-${n}`,
        fill: colors[depth % colors.length]
      }));
      _Q_svg.push(circle((Q[n+1]), 2, {
        id: `circle-${depth}-${n+1}`,
        fill: colors[depth % colors.length]
      }));
      _Q_svg.push(line((Q[n]), Q[n+1], {
        id: `line-${depth}-${n}`,
        fill: 'none',
        'stroke-width': 0.5,
        stroke: colors[depth % colors.length]
      }));

      v = SUB(Q[n+1], Q[n]);
      len = MAG(v);
      q_n = ADD(
        MULT(NORM(v), (len/BEZIER_SAMPLE_RATE)*i),
        Q[n]
      );

      _Q.push(q_n);
    }
    __ns(getSFG(), {}, ..._Q_svg);

    /* Base case */
    if (_Q.length === 1) {
      return _Q[0];
    }

    return bezier(depth+1, i, ..._Q);
  };

  let vecs = [];
  let _i = 0;
  let int_num = setInterval(() => {
    if (_i <= BEZIER_SAMPLE_RATE) {
      let _v = bezier(0, _i, ...P);
      vecs.push(_v);
      __ns(getSFG(), {}, polyline(VECS_TO_POINTS(vecs), {
        fill: 'none',
        stroke: 'red',
        'stroke-width': 3
      }));
      __ns(getSFG(), {}, circle(_v, 1, {
        fill: 'yellow'
      }));
      _i++;
    } else {
      clearInterval(int_num);
      __ns(getSFG(), {}, polyline(VECS_TO_POINTS(vecs), {
        fill: 'none',
        stroke: 'red',
        'stroke-width': 3
      }));
    }
  }, 20);
}

const _sfg = [
  {
    id: 'v1',
    x: 100, y: 100,
    outgoingEdges: [
      {
        id: 'e2',
        startNode: 'v1',
        endNode: 'v3'
      }
    ]
  },
  {
    id: 'v2',
    x: 200, y: 30,
    outgoingEdges: [
      {
        id: 'e1',
        startNode: 'v2',
        endNode: 'v1'
      }
    ]
  },
  {
    id: 'v3',
    x: 400, y: 200,
    outgoingEdges: [
      {
        id: 'e3',
        startNode: 'v3',
        endNode: 'v2'
      }
    ]
  },
  {
    id: 'v4',
    x: 100, y: 300,
    outgoingEdges: [
      {
        id: 'e5',
        startNode: 'v4',
        endNode: 'v1'
      },
      {
        id: 'e6',
        startNode: 'v4',
        endNode: 'v2'
      },
      {
        id: 'e7',
        startNode: 'v4',
        endNode: 'v3'
      }
    ]
  }
];

init(_sfg);
visualize_bezier();
