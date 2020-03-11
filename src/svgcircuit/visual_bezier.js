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
