// --------------------------------------------------------------------------------------------
// Circuit API for circuit analysis
const nl = require('./netlist.js');
const assert = require('assert');
const algebra = require('algebra.js');
const Expression = algebra.Expression;

function Node(id, v) {
    this.id = id,
    this.voltage = v,
    this.passiveComponents = [] // array of connected passive components
};

Node.prototype.kcl = function(){
    var sum_string = "";
    console.log(`KCL at node ${this.id.toString()}`);
    for (var i = 0; i < this.passiveComponents.length; i++){
        console.log(`I${i} = ${this.passiveComponents[i].i}`);
        sum_string += `I${i} + `;
    }
    var last_plus_index = sum_string.lastIndexOf('+');
    sum_string = sum_string.slice(0, last_plus_index);
    sum_string += '= 0';
    console.log(sum_string);
};

function Circuit(n, vsrc) {
    this.nodes = n // array of node objects
    this.unknownVnodes = [] // array of node ids that have unknown voltage values
    this.numVsrc = vsrc // number of voltage sources in circuit
};

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

    this.unknownVnodes.forEach((n_id) => {
        this.findNodeById(n_id).kcl();
    });
};

function Resistor(r, p, n){
    this.value = r;
    this.pnode = p;
    this.nnode = n;
    this.current = undefined;
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
    this.i = '(' +  numer.toString() + ')' + '/' + denom.toString();
};

function createCircuit(components){
    // Initialize an empty Circuit object
    var circuit = new Circuit([], 0);

    components.forEach((c) => {
        // adding nodes
        var nodeid = c.pnode;
        
        for (var i = 0; i < 2; i++){
            const nodeExists = circuit.nodeExists(nodeid);
            if (!nodeExists){
                if (nodeid == 0){ // ground node
                    v = 0
                }
                else if (c.type == 'V'){ // node voltage is known
                    // V_pnode > V_nnode
                    if (i == 0 && c.nnode == 0){
                        v = c.value;
                    }
                    // V_pnode < V_nnode
                    else if (i == 1 && c.pnode == 0){
                        v = c.value * -1;
                    }
                }
                else{
                    circuit.unknownVnodes.push(nodeid);
                    v = undefined; //node voltage is unknown
                }
                node = new Node(nodeid, v);
                circuit.nodes.push(node);
            } 
            nodeid = c.nnode;
        }

        if (c.type == 'V'){
            circuit.numVsrc ++;
        }
        else if (c.type == 'R'){
            r = new Resistor(c.value, c.pnode, c.nnode);
            r.ohmsLaw(circuit);
            pnode = circuit.findNodeById(c.pnode);
            nnode = circuit.findNodeById(c.nnode);
            pnode.passiveComponents.push(r);
            nnode.passiveComponents.push(r);
        }
    });

    return circuit;
} 



(function main(){
    var example = [ { id: 'V1', type: 'V', pnode: 1, nnode: 0, value: 8 },
    { id: 'V2', type: 'V', pnode: 0, nnode: 3, value: 2 },
    { id: 'R1', type: 'R', pnode: 1, nnode: 2, value: 1000 },
    { id: 'R2', type: 'R', pnode: 2, nnode: 0, value: 2000 },
    { id: 'R3', type: 'R', pnode: 2, nnode: 3, value: 3000 } ];
    var circuit = createCircuit(example);
    //console.log(JSON.stringify(circuit));
    circuit.nodalAnalysis();
})();