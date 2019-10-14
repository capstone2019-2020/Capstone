const express = require('express');
const bodyParser = require('body-parser');	// pull info from HTML POST (express4)
const m1 = require("./m1.js");
const algebra = require('algebra.js');
const app = express();
const path = require('path');
const router = express.Router();
const port = process.env.PORT || 3000;
const equations = [];
let nodes, startNode, endNode, masonsdata;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var urlencodedParser = bodyParser.urlencoded({ extended: false});
app.use(express.static('public'));
app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname+ '/index.html'));
// });

// Receive user request and parse into the eqns
// Saves the eqns into an array named eqns
// Also saves the start and end node information
app.post("/input-form", (req, res) => {
    let eqns = req.body.eqns;
    console.log(req.body);
    startNode = req.body.start;
    endNode = req.body.end;

    // No eqns has been entered
    if (!req.body.eqns) {
        return res.status(400).send("Missing Equation");
    }
    
    // The eqns array is emptied every time the input post is used
    if (equations.length != 0) {
        equations.length = 0;
    }

    eqns.forEach((eq) => equations.push(algebra.parse(eq)));
    res.set({

    });
    return res.status(200).send(eqns);
});

// Send back the nodes array as successful
app.get("/computeSFG", (req, res) => {
    nodes = m1.computeSFG(equations);
    res.status(200).send(nodes);
});

// Get the computeMasons eqns
app.get("/computeMasons", (req, res) => {
    masonsdata = m1.computeMasons(nodes, startNode, endNode);
    res.status(200).send({n: masonsdata.n.toString(), d: masonsdata.d.toString()});
});


// add router
app.use('/', router);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
