function visualize_bezier() {
  const colors = ['grey', 'blue', 'green', 'orange', 'purple'];
  let P = [
    sg___vec(0,0), sg___vec(-0.5,2), sg___vec(2,2),
    sg___vec(3,0.5), sg___vec(3.5,2), sg___vec(4,0)
  ];
  P = scale(P, sg___vec(50, 50));
  P = trans(P, sg___vec(500, 100));

  /* Recursive inner function */
  const bezier = (depth, i, ...Q) => {
    if (!Q.length) return;

    let _Q = [];
    let _Q_svg = [];

    let q_n, v, len;
    let n;
    for (n=0; n<Q.length-1; n++) {
      let c_dn1 = sg_ELEM(`circle-${depth}-${n}`);
      let c_dn2 = sg_ELEM(`circle-${depth}-${n+1}`);
      let l_dn = sg_ELEM(`line-${depth}-${n}`);
      if (sg_DEFINED(c_dn1)) {
        getSFG().removeChild(c_dn1);
      }
      if (sg_DEFINED(c_dn2)) {
        getSFG().removeChild(c_dn2);
      }
      if (sg_DEFINED(l_dn)) {
        getSFG().removeChild(l_dn);
      }

      _Q_svg.push(sg_circle((Q[n]), 2, {
        id: `circle-${depth}-${n}`,
        fill: colors[depth % colors.length]
      }));
      _Q_svg.push(sg_circle((Q[n+1]), 2, {
        id: `circle-${depth}-${n+1}`,
        fill: colors[depth % colors.length]
      }));
      _Q_svg.push(sg_line((Q[n]), Q[n+1], {
        id: `line-${depth}-${n}`,
        fill: 'none',
        'stroke-width': 0.5,
        stroke: colors[depth % colors.length]
      }));

      v = sfg_SUB(Q[n+1], Q[n]);
      len = sfg_MAG(v);
      q_n = sfg_ADD(
        sfg_MULT(sfg_NORM(v), (len/BEZIER_SAMPLE_RATE)*i),
        Q[n]
      );

      _Q.push(q_n);
    }
    sg___ns(getSFG(), {}, ..._Q_svg);

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
      sg___ns(getSFG(), {}, sg_polyline(sfg_VECS_TO_POINTS(vecs), {
        fill: 'none',
        stroke: 'red',
        'stroke-width': 3
      }));
      sg___ns(getSFG(), {}, sg_circle(_v, 1, {
        fill: 'yellow'
      }));
      _i++;
    } else {
      clearInterval(int_num);
      sg___ns(getSFG(), {}, sg_polyline(sfg_VECS_TO_POINTS(vecs), {
        fill: 'none',
        stroke: 'red',
        'stroke-width': 3
      }));
    }
  }, 20);
}
