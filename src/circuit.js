// --------------------------------------------------------------------------------------------
// Circuit API for circuit analysis
const nl = require('./netlist.js');
const assert = require('assert');
const algebra = require('algebra.js');
const math = require('mathjs');
const Expression = algebra.Expression;
var circuit;

function Node(id, v) {
    this.id = id,
    this.voltage = v,
    this.passiveComponents = [], // array of connected passive components (currently, only Resistor objects)
    this.currentSources = [], // array of CurrentSource objects
    this.incomingBranches = [],
    this.outgoingBranches = []
};
Node.prototype.allCurrentKnown = function(){
    // only current source(s) is/are connected to the node
    if (this.passiveComponents.length == 0 && this.currentSources.length != 0){
        return true;
    }
    else if (this.passiveComponents.length > this.currentSources.length){
        return false;
    }
    else if (this.passiveComponents.length == this.currentSources.length){
        var ret = true;

        this.passiveComponents.forEach((p) => {
            this.currentSources.forEach((c) => {
                 ret = resistorInSeriesWithCSrc(p, c);

                 //if(ret){
                 //   p.currentNumeric = c.value;
                 //}
            });

            if (!ret){
                return ret;
            }
            
        });
        return ret;
    }
};

Node.prototype.kcl = function(){
    var sum_string = "";
    var equations = [];

    for (var i = 0; i < this.passiveComponents.length; i++){
        pComp = this.passiveComponents[i];

        if (pComp instanceof Resistor){
            pComp.ohmsLaw(circuit);
        }

        if (pComp.currentNumeric != undefined){
            //console.log(`${pComp.currentNumeric} = ${pComp.current}`);
            equations.push(`${pComp.currentNumeric} = ${pComp.current}`);
            sum_string += `+ (${pComp.currentNumeric})`;
        }
        else{
            //console.log(`I${i} = ${pComp.current}`);
            equations.push(`I${i} = ${pComp.current}`);
            var sign = "";
            if (this.id == pComp.pnode){
                sign = '-';
            } 
            else{
                if (i != 0){
                    sign = '+';
                }
                else{
                    sum_string += `I${i} `;
                    continue;
                }
            }
            sum_string += `${sign} I${i} `;
        }
    }

    this.currentSources.forEach((c) => {
        sum_string += `+ (${c.value})`;
    });

    //var last_plus_index = sum_string.lastIndexOf('+');
    //sum_string = sum_string.replace(1, last_plus_index);
    sum_string += ' = 0';
    //console.log(sum_string);
    equations.push(sum_string);
    return equations;
};

/* Calculate Driving Point Impedance 
   DPI = The impedance seen at a node when when we zero all the other node voltages and all
         current sources in the circuit */
Node.prototype.computeDpi = function(){
    var inverseSum = 0; // store (1/R1 + 1/R2 + ... + 1/Rn)
    /*var allConnectedBranches = this.incomingBranches.concat(this.outgoingBranches);
    var branchToIgnore;
    
    // If current source is zeroed out -> open circuit -> that branch can be ignored
    this.currentSources.forEach ((c) => {
        if (c.pnode == this.id){
            branchToIgnore = allConnectedBranches.indexOf(c.nnode);
        }
        else if (c.nnode == this.id){
            branchToIgnore = allConnectedBranches.indexOf(c.pnode);
        }

        // Something is wrong if the other side node of current source is not in allConnectedBranches
        assert(branchToIgnore != -1); 
        allConnectedBranches.splice(branchToIgnore, 1);
    });

    this.passiveComponents.forEach ((r) => {
        if ((r.pnode == this.id && allConnectedBranches.includes(r.nnode) != -1) ||
            (r.nnode == this.id && allConnectedBranches.includes(r.pnode) != -1)) {
                inverseSum += math.inv(r.value);
        }
    });
    */
   this.passiveComponents.forEach ((r) => {
    if (r.currentNumeric == undefined){
            inverseSum += math.inv(r.value);
    }
    });
    return math.inv(inverseSum);
};

/* Helper function for dpiAnalysis()
   short circuit current = The net current that flows into node n if node n is grounded and
   the currents due to all the other node voltages and current
   sources are added together */
Node.prototype.computeShortCircuitCurrent = function(){
    iShortCircuit = "";

    // Ignore passive components connected to ground
    this.passiveComponents.forEach ((r, i) => {
        // no current flows for the branch that has ground on both ends
        if (r.pnode != 0 && r.nnode != 0) {
            // current goes from pnode->nnode: current going out -> negative by convention
            if (this.id == r.pnode){
                iShortCircuit += " - ";
            } 
            else{
                // Skip (+) sign for the first term
                if (i != 0){
                    iShortCircuit += " + ";
                }
            }

            // Determine if numeric current value is available
            if (r.currentNumeric != undefined){
                iShortCircuit += r.currentNumeric.toString();
            }
            else{
                iShortCircuit += r.current;
            }

        }
    });

    this.currentSources.forEach ((c) => {
        // @TODO: may have to add more logic to determine the sign
        if (iShortCircuit.length > 0){ 
            iShortCircuit += " + ";
        }

        iShortCircuit += c.value.toString();
    });

    return iShortCircuit;
};

/* Calculate Driving Point Impedance and short circuit current at the node 
   n is the ID of the node at which DPI analysis will be done */
Node.prototype.dpiAnalysis = function(){
    var dpi = this.computeDpi();
    var isc = this.computeShortCircuitCurrent();

    return [dpi, isc];
};

function Circuit(n, vsrc) {
    this.nodes = n // array of node objects
    this.unknownVnodes = [] // array of node ids that have unknown voltage values
    this.numVsrc = vsrc // number of voltage sources in circuit
};

/* Return True if a node with id 'nid' has not been added
   to the circuit object */
Circuit.prototype.nodeExists = function(nid){
    var exists = false;

    this.nodes.forEach((n) => {
        if (n.id == nid){
            exists = true;
            return;
        }
    });

    return exists;
};

Circuit.prototype.findNodeById = function(nid){
    return this.nodes.find(n => n.id === nid);
};

Circuit.prototype.nodalAnalysis = function(){
    const numEqToSolve = this.nodes.length - this.numVsrc - 1;
    assert(this.unknownVnodes.length == numEqToSolve);

    var resultSummary = new AnalysisSummary();
    var equations_at_nodes = [];    // Store a list of equations at node x

    this.unknownVnodes.forEach((n_id) => {
        unknownVnode = this.findNodeById(n_id);
        
        if (unknownVnode.allCurrentKnown()){
            return;
        }
    
        // --- Start nodal analysis ---
        var equations = unknownVnode.kcl();

        if (equations != undefined){
            equations_at_nodes.push(equations);
        }
        // --- End nodal analysis ---

        // --- Start DPI analysis ---
        var dpiAndShortCurrent = unknownVnode.dpiAnalysis();
        // --- End DPI analysis ---

        resultSummary.addSummary(n_id,
                                 dpiAndShortCurrent[0],
                                 dpiAndShortCurrent[1],
                                 equations_at_nodes);
    });

    return resultSummary;
};

function Resistor(r, p, n){
    this.value = r;
    this.pnode = p;
    this.nnode = n;
    this.current = undefined;
    this.currentNumeric = undefined;
};

Resistor.prototype.ohmsLaw = function(circuit){
    const pnode = circuit.findNodeById(this.pnode);
    const nnode = circuit.findNodeById(this.nnode);
    if (pnode.voltage == undefined){
        var vp = "n" + (pnode.id).toString();
    }
    else{
        var vp = pnode.voltage;
    }
    if (nnode.voltage == undefined){
        var np = "n" + (nnode.id).toString();
    }
    else{
        var np = nnode.voltage;
    }

    var numer = new Expression(vp).subtract(np);
    var denom = this.value;
    this.current = '(' +  numer.toString() + ')' + '/' + denom.toString();
};

function CurrentSource(i, p, n){
    this.value = i;
    this.pnode = p;
    this.nnode = n;
};

function resistorInSeriesWithCSrc(r, csrc){
    if (r.pnode == csrc.pnode){
        r.currentNumeric = -1 * csrc.value;
        return true;
    }
    else if (r.pnode == csrc.nnode){
        r.currentNumeric = csrc.value;
        return true;
    }
    else if (r.nnode == csrc.pnode){
        r.currentNumeric = csrc.value;
        return true;
    }
    else if (r.nnode == csrc.nnode){
        r.currentNumeric = -1 * csrc.value;
        return true;
    }
    else {
        false;
    }
}
function createCircuit(components){
    // Initialize an empty Circuit object
    var circuit = new Circuit([], 0);
    var nodeOfInterest;

    components.forEach((c) => {
        // adding nodes
        var nodeid = c.pnode;
        
        for (var i = 0; i < 2; i++){
            const nodeExists = circuit.nodeExists(nodeid);
            // Adding nodes to Circuit object
            if (!nodeExists){
                if (nodeid == 0){ // ground node
                    v = 0
                }

                else{
                    circuit.unknownVnodes.push(nodeid);
                    v = undefined; //node voltage is unknown
                }
                
                node = new Node(nodeid, v);
                circuit.nodes.push(node);
            }

            nodeOfInterest = circuit.findNodeById(nodeid);
            // node of interest is pnode - nodes specified as nnode is outgoing branches
            if (i == 0){
                var outgoingB = nodeOfInterest.outgoingBranches;
                if (!outgoingB.includes(c.nnode)){
                    outgoingB.push(c.nnode);
                }
            }
            // node of interest is nnode - nodes specified as pnode is incoming branches 
            else{
                var incomingB = nodeOfInterest.incomingBranches;
                if (!incomingB.includes(c.pnode)){
                    incomingB.push(c.pnode);
                }
            }
            nodeid = c.nnode;
        }

        if (c.type == 'V'){
            var indexUnknownVnodes;

            circuit.numVsrc ++;

            // Set the voltage value
            if (c.nnode == 0){
                var pnode = circuit.findNodeById(c.pnode);
                pnode.voltage = c.value;
            }
            else if (c.pnode == 0){
                var nnode = circuit.findNodeById(c.nnode);
                nnode.voltage = c.value * -1;
            }

            // Remove pnode and nnode of Voltage source from unknownVnodes array
            indexUnknownVnodes = circuit.unknownVnodes.indexOf(c.pnode);
            if (indexUnknownVnodes != -1){
                circuit.unknownVnodes.splice(indexUnknownVnodes, 1);
            }
            indexUnknownVnodes = circuit.unknownVnodes.indexOf(c.nnode);
            if (indexUnknownVnodes != -1){
                circuit.unknownVnodes.splice(indexUnknownVnodes, 1);
            }
        }
        else if(c.type == 'I'){
            cSrc  = new CurrentSource(c.value, c.pnode, c.nnode);
            pnode = circuit.findNodeById(c.pnode);
            nnode = circuit.findNodeById(c.nnode);
            pnode.currentSources.push(cSrc);
            nnode.currentSources.push(cSrc);
        }
        else if (c.type == 'R'){
            r = new Resistor(c.value, c.pnode, c.nnode);
            //r.ohmsLaw(circuit);
            pnode = circuit.findNodeById(c.pnode);
            nnode = circuit.findNodeById(c.nnode);
            pnode.passiveComponents.push(r);
            nnode.passiveComponents.push(r);
        }
    });

    return circuit;
}

/* A stucture to store useful results from circuit analysis 
   This stucture can be used to compare analysis outputs for unit testing
   or passed into SFG functions 
   Use index to access the correct member variable in the arrays
   For example, if 4th element of nodeId array is 2, dpi[4] and currentEquations[4] will
   give you dpi and equations for node #2 */
function AnalysisSummary() {
    this.nodeId = [], // IDs of nodes
    this.dpi = [], // Driving point impedances (returned by dpiAnalysis())
    this.shorCircuitCurrent = [] // also returned by dpiAnalysis()
    this.currentEquations = [] // lists of equations returned by kcl()
};

AnalysisSummary.prototype.addSummary= function(id, dpi, isc, eqs){
    this.nodeId.push(id);
    this.dpi.push(dpi);
    this.shorCircuitCurrent.push(isc);
    this.currentEquations.push(eqs);
};

 (function main(){
    const voltage_div = 'test/netlist_ann1.txt'
    const var_simple = 'test/netlist_ann2.txt'
    const curr_src = 'test/netlist_ann_csrc.txt'

    var c = [
        { id: 'I1', type: 'I', pnode: 1, nnode: 0, value: '0.003'  },
        { id: 'R1', type: 'R', pnode: 1, nnode: 0, value: '4000'  },
        { id: 'R2', type: 'R', pnode: 1, nnode: 2, value: '5600'  },
        { id: 'I2', type: 'I', pnode: 0, nnode: 2, value: '0.002'  }
    ];

    c = nl.nlConsume(curr_src);
    circuit = createCircuit(c);

    console.log(JSON.stringify(circuit.nodalAnalysis()));
 })();
