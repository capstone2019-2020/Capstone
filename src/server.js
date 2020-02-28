const express = require('express');
const bodyParser = require('body-parser');	// pull info from HTML POST (express4)
const m1 = require("./nodeJS/m1.js");
const circuitjs = require('./nodeJS/circuit.js');
const algebra = require('./RWalgebra/RWalgebra.js');
const netlist = require('./nodeJS/netlist.js');
const app = express();
const Expression = algebra.Expression;
const Equation = algebra.Equation;
const fileupload = require('express-fileupload');
const router = express.Router();
const port = process.env.PORT || 3000;
const equations = [];
let nodes, startNode, endNode, masonsdata, circuit;

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
    if (stuff[0].search('\n') !== -1) {
      c = netlist.nlConsumeArr(stuff.toString().split('\n'));
    } else {
      c = netlist.nlConsumeArr(stuff);
    }

    // The nlConsume is not working properly
    if (!c) {
        return res.status(400).send("nlConsume Missing");
    }

    // The eqns array is emptied every time the input post is used
    if (equations.length != 0) {
        equations.length = 0;
    }

    // Create circuit
    circuit = circuitjs.createCircuit(c);
    let temp = circuit.nodalAnalysis();

//     temp.currentEquations.forEach(first => first.forEach(second => second.forEach(eqns => console.log(eqns.toString()))));
    temp.currentEquations.forEach((first) => 
        first.forEach((second) => second.forEach((eqns) => 
            {
                // This is a replacement for solveFor of algebra.js to make all the equations have a format of
                // x1 = x2 +..... => one variable on the LHS and the rest on the RHS
                if (eqns.lhs.real.terms.length !== 1 && eqns.lhs.imag.terms.length !== 1) {
                    let newlhs, location, found = false, finaleqn, lhsIsConstant = false, coeff;

                    // For the case where LHS only has constant and no terms
                    if (eqns.lhs.real.terms.length === 0 && eqns.lhs.imag.terms.length === 0) {
                        if (eqns.lhs.real.constant !== null || eqns.lhs.imag.constant !== null) {
                            // Pick a variable from rhs (first variable)
                            if (eqns.rhs.real.terms.length !== 0) {
                                newlhs = new Expression(eqns.rhs.real.terms[0].toString());
                                coeff = eqns.rhs.real.terms[0].coefficient;
                            } else {
                                newlhs = new Expression(eqns.rhs.imag.terms[0].toString());
                                coeff = eqns.rhs.imag.terms[0].coefficient;
                            }
                            lhsIsConstant = true;
                        }
                    }

                    // LHS has terms
                    if (eqns.lhs.real.terms.length !== 0) {
                        newlhs = new Expression(eqns.lhs.real.terms[0].toString());
                        coeff = eqns.lhs.real.terms[0].coefficient;
                    } else if (eqns.lhs.imag.terms.length !== 0) {
                        newlhs = new Expression(eqns.lhs.imag.terms[0].toString());
                        coeff = eqns.lhs.imag.terms[0].coefficient;
                    }

                    // Check if the variable already exits
                    for (var i = 0; i < equations.length; i++) {
                        if (equations[i].lhs.real.terms.length !== 0) {
                            if (equations[i].lhs.real.terms[0].toString() === newlhs.toString()) {
                                found = true;
                                location = i;
                            }
                        } else {
                            if (equations[i].lhs.imag.terms[0].toString() === newlhs.toString()) {
                                found = true;
                                location = i;
                            }
                        }
                    }

                    // Split the string of the expression
                    let strOflhs, temprhs, existingRHS;
                    if (lhsIsConstant === true) {
                        // console.log("ENTERED HERE");
                        strOflhs = eqns.toString().split(newlhs.toString());
                        // console.log(strOflhs);
                        existingRHS = strOflhs[1];
                        // console.log(`Existing RHS: ${existingRHS.toString()}}`);
                        strOflhs = strOflhs[0].split("=");
                        strOflhs = strOflhs[0];
                        // console.log(`To become RHS terms: ${strOflhs.toString()}`)

                        if (existingRHS.toString().substring(0, 2).indexOf('+') != -1) {
                            existingRHS = existingRHS.substring(3, existingRHS.length);
                        }

                        // The RHS was not 0
                        if (existingRHS.length !== 0) {
                            temprhs = new Expression(existingRHS.toString());
                            temprhs.multiply(-1);
                            // console.log(temprhs.toString());
                            // temprhs = temprhs.add(strOflhs.toString());
                            temprhs = temprhs.toString() + (strOflhs > 0 ? "+" : "") + strOflhs.toString();
                            // console.log(temprhs.toString());
                            temprhs = new Expression(temprhs.toString());
                        } else {
                            temprhs = strOflhs;
                        }
                        // console.log(temprhs.toString());
                    } else {
                        // console.log("Entered THERE");
                        strOflhs = eqns.toString().split(newlhs.toString());
                        strOflhs = strOflhs[1].split("=");
                        existingRHS = strOflhs[1];
                        strOflhs = strOflhs[0];
                        if (strOflhs.toString().substring(0, 2).indexOf('+') !== -1) {
                            strOflhs = strOflhs.substring(3, strOflhs.length);
                        }

                        if (existingRHS.toString().substring(0, 2).indexOf('+') !== -1) {
                            existingRHS = existingRHS.substring(3, existingRHS.length);
                        }
                        temprhs = new Expression(strOflhs.toString());
                        temprhs.multiply(-1);

                        // The RHS was not 0
                        if (existingRHS.length !== 0) {
                            temprhs = temprhs.add(new Expression(existingRHS.toString()));
                        }
                    }

                    // The coefficient of the term was not 1
                    if (coeff !== 1 && typeof(temprhs) !== "string") {
                        // console.log("ENTERED HERE!!!!!")
                        temprhs.divide(coeff.toString());
                        newlhs = newlhs.divide(coeff.toString());
                    }
                    // console.log(`New LHS: ${newlhs} and new RHS: ${temprhs}`);

                    if (found === true) {
                        let replacetemp = equations[location].toString().split('=');
                        replacetemp = new Expression (replacetemp[1]);
                        replacetemp.add(temprhs);
                        finaleqn = newlhs.toString() + " = " + replacetemp;
                        // console.log(finaleqn.toString());
                        equations[location] = algebra.parse(finaleqn.toString());
                    } else {
                        finaleqn = newlhs.toString() + " = " + temprhs.toString();
                        // console.log(finaleqn.toString());
                        equations.push(algebra.parse(finaleqn.toString()));
                    }
                } else {
                    let temp;

                    // There is a coefficient in the lhs
                    if (eqns.lhs.real.terms.length !== 0) {
                        if (eqns.lhs.real.terms[0].coefficient !== 1) {
                            temp = new Equation(eqns.toString());
                            temp.lhs.divide(eqns.lhs.real.terms[0].coefficient);
                            temp.rhs.divide(eqns.lhs.real.terms[0].coefficient);
                            eqns = new Equation(temp.lhs, temp.rhs);
                        }
                    } else if (eqns.lhs.imag.terms.length !== 0) {
                        if (eqns.lhs.imag.terms[0].coefficient !== 1) {
                            temp = new Equation(eqns.toString());
                            temp.lhs.divide(eqns.lhs.imag.terms[0].coefficient);
                            temp.rhs.divide(eqns.lhs.imag.terms[0].coefficient);
                            eqns = new Equation(temp.lhs, temp.rhs);
                        }
                    }

                    // console.log(eqns.toString());
                    equations.push(algebra.parse(eqns.toString()));
                }
            }
        ))
    );

    // Combine DPI and shortcircuit - ERROR WITH DPI * SHORCIRCUIT
    for (var i = 0; i < temp.dpi.length; i++) {
        let lhs = new Expression(`V${temp.nodeId[i]}`);
        // console.log(temp.dpi[i].toString());
        // console.log(temp.shorCircuitCurrent[i]);
        let rhs = temp.dpi[i].multiply(temp.shorCircuitCurrent[i]);
        let tempEqn = new Equation(lhs, rhs);
        // console.log(tempEqn.toString());
        equations.push(algebra.parse(tempEqn.toString()));
    }

    if(!circuit) {
        return res.status(400).send("Create circuit missing");
    }

    if (!req.body.contents) {
        return res.status(400).send("Missing contents of file");
    }

    // Read the netlist file and save the content
    return res.status(200).send(equations);
});

// Receive user request and parse into the eqns
// Saves the eqns into an array named eqns
// Also saves the start and end node information
app.post("/input-form", (req, res) => {
    let eqns = req.body.eqns;
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
    return res.status(200).send(eqns);
});

// Send back the nodes array as successful
app.get("/computeSFG", (req, res) => {
    nodes = m1.computeSFG(equations);
    const loopGain = m1.computeLoopGain(nodes);
    res.status(200).send({ sfg: nodes,
    bode: {
        phase: loopGain.bode.phase,
        magnitude: loopGain.bode.magnitude
    }
    });
});


// Get the computeMasons eqns
app.post("/computeMasons", (req, res) => {
    startNode = req.body.start;
    endNode = req.body.end;
    masonsdata = m1.computeMasons(nodes, startNode, endNode);

    let letters = /^[A-Za-z]+$/;
    let newDenom = "", newNumer = "";

    // Changing into format that can be parsed by algebra.js
    tempdenom = masonsdata.d.toString().split("");
    tempnumer = masonsdata.n.toString().split("");

    // Checking the denominators
    for (let i = 0; i < tempdenom.length-1; i++) {
        if (tempdenom[i].match(letters) && tempdenom[i+1].match(letters)) {
        newDenom = newDenom + tempdenom[i]+"*";
        }
        else {
        newDenom = newDenom + tempdenom[i];
        }
    }

    // Checking the numerators
    for (let i = 0; i < tempnumer.length-1; i++) {
        if (tempnumer[i].match(letters) && tempnumer[i+1].match(letters)) {
        newNumer = newNumer + tempnumer[i]+"*";
        }
        else {
        newNumer = newNumer + tempnumer[i];
        }
    }
    
    // Include the last part of the denom and numer
    newNumer = newNumer+tempnumer[tempnumer.length-1];
    newDenom = newDenom+tempdenom[tempdenom.length-1];

    res.status(200).send({n: newNumer.toString(), d: newDenom.toString(),
                          bode: { phase: masonsdata.bode.phase, magnitude: masonsdata.bode.magnitude }});
});


// add router
app.use('/', router);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
