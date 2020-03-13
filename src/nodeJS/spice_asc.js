const MAX_SUPPORTED_PARAMS = 6;
const R_t = 'R';
const L_t = 'L';
const C_t = 'C';
const V_t = 'V';
const I_t = 'I';
const VCVS_t = 'E';
const VCCS_t = 'G';
const CCVS_t = 'H';
const W_t = 'W';
const CCCS_t = '';

const SUPPORTED_TYPES = [R_t, L_t, C_t, I_t, V_t, VCVS_t, VCCS_t, CCVS_t, CCCS_t];
const CONVERSION_LUT = {
  'G': 1000000000,
  'M': 1000000,
  'k': 1000,
  'm': 0.001,
  'u': 0.000001,
  'n': 0.000000001,
  'p': 0.000000000001
};
const ASC_TO_TYPE_LUT = {
  'voltage': V_t,
  'g': VCCS_t,
  'e': VCVS_t,
  'current': I_t,
  'ind': L_t,
  'cap': C_t,
  'res': R_t
};
const DEFINED = (v) => v !== null && v !== undefined;

// export these to be used in other modules
exports.TYPES = {R_t, L_t, C_t, V_t, I_t, VCVS_t, VCCS_t};

function assert(bool) {
  if (!bool) {
    throw new Error('Assertion failed!');
  }
}

function assertComponents(components) {
  let i, j, c;
  for (i = 0; i < components.length; i++) {
    c = components[i];
    assert(SUPPORTED_TYPES.includes(c.type));

    // special check for dependent sources
    if ([VCVS_t, VCCS_t].includes(c.type)) {
      assert(DEFINED(c.ctrlPNode) && DEFINED(c.ctrlNNode));
    } else {
      delete c.ctrlPNode;
      delete c.ctrlNNode;
    }

    if ([CCVS_t, CCCS_t].includes(c.type)) {
      assert(DEFINED(c.vbranch));
    } else {
      delete c.vbranch;
    }

    // check for name uniqueness
    for (j = i+1; j < components.length; j++)
      assert(c.id !== components[j].id);
  }
}

function toNetlist(arr) {
  let components = [];

  let a, i, line, val, multiplier;
  for (i = 0; i < arr.length; i++) {
    if (!(line = arr[i]).length) {
      continue;
    }

    a = line.replace(/[!@#$%^&*\r]/g, '')
      .trim().split(' ');
    assert(a.length <= MAX_SUPPORTED_PARAMS);

    // value for 4-operand input
    val = a[3];

    // Check for voltage controlled dependent source
    let cpnode, cnnode;
    if ([VCVS_t, VCCS_t].includes(a[0][0])) {
      assert(a.length === 6);
      cpnode = a[3];
      cnnode = a[4];
      val = a[5];
    }

    // Check for current controlled dependent source
    let vbranch;
    if ([CCCS_t, CCVS_t].includes(a[0][0])) {
      assert(a.length === 5);
      vbranch = a[3];
      val = a[4];
    }

    multiplier = val.slice(-1);
    if (CONVERSION_LUT.hasOwnProperty(multiplier)) {
      multiplier = CONVERSION_LUT[multiplier];
      val = parseFloat(val.slice(0, -1));
    } else {
      multiplier = 1;
      val = parseFloat(val);
    }

    cpnode = parseInt(cpnode);
    cnnode = parseInt(cnnode);
    components.push({
      id: a[0],
      type: a[0][0],
      pnode: parseInt(a[1]),
      nnode: parseInt(a[2]),
      ctrlPNode: !isNaN(cpnode) ? cpnode : undefined, // voltage controlled
      ctrlNNode: !isNaN(cnnode) ? cnnode : undefined, // voltage controlled
      vbranch: DEFINED(vbranch) ? vbranch : undefined, // current controlled
      value: val * multiplier
    });
  }

  assertComponents(components);
  return components;
}

function fromAsc(buf, dim={x:1500,y:1000}) {
  let lines = buf.split('\n');
  let netlist, asc;
  let _asc_lines = [];
  {
    let _netlist_lines = [];
    let line;
    let i;
    for (i=0; i<lines.length; i++) {
      line = lines[i].split(' ');
      if (line[0] === ';') {
        _netlist_lines.push(line.slice(1).join(' '));
      } else {
        _asc_lines.push(lines[i]);
      }
    }

    netlist = toNetlist(_netlist_lines);
  }

  let xDim, yDim;
  {
    asc = [];
    let line, elem, isInsert;
    let i;
    for (i=0; i<_asc_lines.length; i++) {
      line = _asc_lines[i].split(' ');
      isInsert = false;
      elem = {
        id: '',
        type: '',
        R: 0,
        p_center: undefined,
        p_from: undefined,
        p_to: undefined
      };

      switch(line[0]) {
        case 'SHEET':
          xDim = parseInt(line[2]);
          yDim = parseInt(line[3]);
          break;
        case 'WIRE':
          isInsert = true;
          elem.id = `wire-${i}`;
          elem.type = W_t;
          elem.p_from = {
            x: parseInt(line[1]),
            y: parseInt(line[2])
          };
          elem.p_to = {
            x: parseInt(line[3]),
            y: parseInt(line[4])
          };
          break;
        case 'SYMBOL':
          isInsert = true;
          elem.type = ASC_TO_TYPE_LUT[line[1]];
          if (!elem.type) {
            throw new Error(`Unsupported type: ${line[1]}`);
          }
          elem.R = parseInt(line[4].slice(1));

          // adjust center position
          switch(elem.type) {
            case V_t:
            case VCCS_t:
            case VCVS_t:
            case I_t:
              if (elem.R === 0) {
                elem.p_center = {
                  x: parseInt(line[2]),
                  y: parseInt(line[3]) + 56
                };
              } else if (elem.R === 90) {
                elem.p_center = {
                  x: parseInt(line[2]) - 56,
                  y: parseInt(line[3])
                };
              } else if (elem.R === 180) {
                elem.p_center = {
                  x: parseInt(line[2]),
                  y: parseInt(line[3]) - 56
                };
              } else {
                elem.p_center = {
                  x: parseInt(line[2]) + 56,
                  y: parseInt(line[3])
                };
              }
              break;
            case R_t:
              if (elem.R === 0) {
                elem.p_center = {
                  x: parseInt(line[2]) + 16,
                  y: parseInt(line[3]) + 56
                };
              } else if (elem.R === 90) {
                elem.p_center = {
                  x: parseInt(line[2]) - 56,
                  y: parseInt(line[3]) + 16
                };
              } else if (elem.R === 180) {
                elem.p_center = {
                  x: parseInt(line[2]) - 16,
                  y: parseInt(line[3]) - 56
                };
              } else {
                elem.p_center = {
                  x: parseInt(line[2]) + 56,
                  y: parseInt(line[3]) - 16
                };
              }
              break;
            case C_t:
            case L_t:
              if (elem.R === 0) {
                elem.p_center = {
                  x: parseInt(line[2]) + 16,
                  y: parseInt(line[3]) + 26
                };
              } else if (elem.R === 90) {
                elem.p_center = {
                  x: parseInt(line[2]) - 26,
                  y: parseInt(line[3]) + 16
                };
              } else if (elem.R === 180) {
                elem.p_center = {
                  x: parseInt(line[2]) - 16,
                  y: parseInt(line[3]) - 26
                };
              } else {
                elem.p_center = {
                  x: parseInt(line[2]) - 26,
                  y: parseInt(line[3]) + 16
                };
              }
              break;
            default:
              elem.p_center = {
                x: parseInt(line[2]),
                y: parseInt(line[3])
              };
          }
          let _line;
          do {
            i++;
            if (i >= _asc_lines.length) {
              break;
            }
            _line = _asc_lines[i].split(' ');
            if (_line[1] === 'InstName') {
              elem.id = _line[2];
              break;
            }
          } while(true);
          break;
        default:
          break;
      }
      if (isInsert) {
        asc.push(elem);
      }
    }
  }

  {
    let minX = Infinity, minY = Infinity;
    let xScale = Math.min(1,dim.x/xDim);
    let yScale = Math.min(1, dim.y/yDim);
    const setMin = (vec) => {
      if (DEFINED(vec)) {
        minX = Math.min(vec.x, minX);
        minY = Math.min(vec.y, minY);
      }
    };
    const adjustPoint = (vec) => {
      if (DEFINED(vec)) {
        return {
          x: vec.x - minX + 50,
          y: vec.y - minY + 100
        };
      } else {
        return vec;
      }
    };
    const adjustScale = (vec) => {
      if (DEFINED(vec)) {
        return {
          x: Math.floor(vec.x * xScale),
          y: Math.floor(vec.y * yScale)
        };
      } else {
        return vec;
      }
    };

    // normalize coordinates
    let elem;
    let i;
    for (i=0; i<asc.length; i++) {
      elem = asc[i];
      setMin(elem.p_center);
      setMin(elem.p_from);
      setMin(elem.p_to);
    }

    for (i=0; i<asc.length; i++) {
      elem = asc[i];
      elem.p_center = adjustPoint(elem.p_center);
      elem.p_from = adjustPoint(elem.p_from);
      elem.p_to = adjustPoint(elem.p_to);
    }

    for (i=0; i<asc.length; i++) {
      elem = asc[i];
      elem.p_center = adjustScale(elem.p_center);
      elem.p_from = adjustScale(elem.p_from);
      elem.p_to = adjustScale(elem.p_to);
    }
  }

  return {
    netlist,
    asc
  }
}

try {
  module.exports = {
    toNetlist,
    fromAsc
  };
} catch(err) {
  /* Swallow error */
}
