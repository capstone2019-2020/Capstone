const SVG_NS = 'http://www.w3.org/2000/svg';
const ID_SFG = 'svg-sfg';
const SZ_CIRCLE_RADIUS = 10;

/* Fake macros */
const AVG = arr => arr.reduce((total, e) => total+e)/arr.length;
const CENTER = vecs => __vec(AVG(vecs.map(v => v.x)), AVG(vecs.map(v => v.y)));
const SHIFT = (v, s) => __vec(v.x+s.x, v.y+s.y);
const MAG = vec => Math.sqrt(Math.pow(vec.x,2)+Math.pow(vec.y,2));
const NORM = vec => __vec(vec.x/MAG(vec), vec.y/MAG(vec));
const DOT = (v1, v2) => v1.x*v2.x + v1.y*v2.y;
const DET = (v1, v2) => v1.x*v2.y - v1.y*v2.x;
const SUB = (v1, v2) => __vec(v1.x-v2.x, v1.y-v2.y);
const ANGLE = (v1, v2) => {
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

function render(V, E) {
  const nodes = Object.values(V).map(v => {
    return circle(v.vec, SZ_CIRCLE_RADIUS, {
        fill: 'black'
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

      edges.push(line(v_from, v_to,
        {stroke: 'red'}
      ));

      /*
       * Find angle between edge vector and the x-axis
       * vector (as a reference). Then rotate the arrow
       * to that position.
       */
      let theta = ANGLE(__vec(-10, 0), SUB(v_to, v_from));
      console.log(`Edge-${e.id}: THETA = ${theta}`);
      arrow = _arrow_();
      arrow = rot(arrow, theta);
      arrow = trans(arrow, CENTER([v_from, v_to]));
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

const _sfg = [
  {
    id: 'v1',
    x: 30, y: 30,
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
  }
];

init(_sfg);
