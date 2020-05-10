const express = require('express');
const bodyParser = require('body-parser');	// pull info from HTML POST (express4)
const m1 = require("./nodeJS/m1.js");
const circuitjs = require('./nodeJS/circuit.js');
const algebra = require('./RWalgebra/RWalgebra.js');
const nl = require('./nodeJS/netlist.js');
const app = express();
const Expression = algebra.Expression;
const Equation = algebra.Equation;
const fileupload = require('express-fileupload');
const {Edge, Node} = require("./nodeJS/datamodel");
const router = express.Router();
const port = process.env.PORT || 80;
let GLOBAL_equations = [];
let GLOBAL_nodes, GLOBAL_startNode, GLOBAL_endNode, GLOBAL_masonsdata, GLOBAL_circuit;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var urlencodedParser = bodyParser.urlencoded({ extended: false});
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(fileupload());

// Receives the file and put list into netlist 
app.post("/input-file", (req, res) => {
    let stuff = req.body.contents;
    let c;

    // The file content is missing
    if (!stuff) {
        return res.status(400).send("Missing Equation");
    }

    // For the case where \n still remains in the array
    let requestNetlist = stuff;
    if (requestNetlist[0].search('\n') !== -1) {
        requestNetlist = stuff.toString().split('\n');
    }

    /*
     * Backwards compatibility with just netlist files
     */
    if (requestNetlist[0].includes(';')) {
        c = nl.ascConsumeArr(requestNetlist);
    } else {
        c = nl.nlConsumeArr(requestNetlist);
        c = {
            netlist: c,
            asc: null,
            nodes: null
        };
    }

    // The nlConsume is not working properly
    if (!c) {
        return res.status(400).send("nlConsume Missing");
    }

    let equations = [];
    // The eqns array is emptied every time the input post is used
    if (GLOBAL_equations.length !== 0) {
        GLOBAL_equations = [];
    }

    // Create circuit
    console.log(c.netlist);
    GLOBAL_circuit = circuitjs.createCircuit(c.netlist);
    let temp = GLOBAL_circuit.dpiAnalysis();

    for (var i = 0; i < temp.length; i++) {
        let strTmp = temp[i].toString();
        GLOBAL_equations.push(strTmp);
        equations.push(strTmp);
    }

    if(!GLOBAL_circuit) {
        return res.status(400).send("Create circuit missing");
    }

    if (!req.body.contents) {
        return res.status(400).send("Missing contents of file");
    }

    // Read the netlist file and save the content
    return res.status(200).send({
        equations: equations,
        asc: c.asc,
        ascNodes: c.nodes
    });
});

// Receive user request and parse into the eqns
// Saves the eqns into an array named eqns
// Also saves the start and end node information
app.post("/input-form", (req, res) => {
    let eqns = req.body.eqns;
    GLOBAL_startNode = req.body.start;
    GLOBAL_endNode = req.body.end;

    // No eqns has been entered
    if (!req.body.eqns) {
        return res.status(400).send("Missing Equation");
    }
    
    // The eqns array is emptied every time the input post is used
    if (GLOBAL_equations.length != 0) {
        GLOBAL_equations.length = 0;
    }

    eqns.forEach((eq) => GLOBAL_equations.push(algebra.parse(eq)));
    return res.status(200).send(eqns);
});

// Send back the nodes array as successful
app.post("/computeSFG", (req, res) => {
    let equations = JSON.parse(req.body.equations);

    let nodes = m1.computeSFG(equations);
    GLOBAL_nodes = nodes; // FIXME backwards compatible

    const loopGain = m1.computeLoopGain(nodes);
    res.status(200).send({
        sfg: nodes,
            bode: {
                phase: loopGain.bode.phase,
                magnitude: loopGain.bode.magnitude
        }
    });
});


// Get the computeMasons eqns
app.post("/computeMasons", (req, res) => {
    let _nodes = JSON.parse(req.body.nodes);
    let nodes = _nodes.map(n => {
        let _n = new Node(n.id, n.value);
        _n.outgoingEdges = n.outgoingEdges.map(e =>
            new Edge(e.weight, e.startNode, e.endNode)
        );

        return _n;
    });
    let startNode = req.body.start;
    let endNode = req.body.end;

    // FIXME backwards compatibility
    GLOBAL_startNode = req.body.start;
    GLOBAL_endNode = req.body.end;
    let masonsdata = m1.computeMasons(nodes, startNode, endNode);
    GLOBAL_masonsdata = masonsdata; // FIXME backwards compatibility

    res.status(200).send({
        n: masonsdata.n.toString(),
        d: masonsdata.d.toString(),
        bode: {
            phase: masonsdata.bode.phase,
            magnitude: masonsdata.bode.magnitude
        }
    });
});


// add router
app.use('/', router);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
