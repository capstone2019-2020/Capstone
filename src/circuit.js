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
    this.currentSources = []
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
    if (this.allCurrentKnown()){
        return;
    }

    var sum_string = "";
    var equations = [];

    console.log(`KCL at node ${this.id.toString()}`);
    for (var i = 0; i < this.passiveComponents.length; i++){
        pComp = this.passiveComponents[i];
        
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
    //var last_plus_index = sum_string.lastIndexOf('+');
    //sum_string = sum_string.replace(1, last_plus_index);
    sum_string += ' = 0';
    //console.log(sum_string);
    equations.push(sum_string);
    return equations;
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

    var equations_at_nodes = [];
    this.unknownVnodes.forEach((n_id) => {
        var equations = this.findNodeById(n_id).kcl();

        if (equations != undefined){
            console.log(equations);
        }
    });

    return equations_at_nodes;
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
                        var indexUnknownVnodes = circuit.unknownVnodes.findIndex(x => x.id == c.pnode);
                        if (indexUnknownVnodes != -1){
                            circuit.unknownVnodes.splice(indexUnknownVnodes, 1);
                        }
                    }
                    // V_pnode < V_nnode
                    else if (i == 1 && c.pnode == 0){
                        v = c.value * -1;
                        var indexUnknownVnodes = circuit.unknownVnodes.findIndex(x => x.id == c.nnode);
                        if (indexUnknownVnodes != -1){
                            circuit.unknownVnodes.splice(indexUnknownVnodes, 1);
                        }
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

            var indexUnknownVnodes;
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
    const voltage_div = 'test/netlist_ann1.txt'
    const var_simple = 'test/netlist_ann2.txt'
    const curr_src = 'test/netlist_ann_csrc.txt'

    example1 = nl.nlConsume(curr_src);
    var circuit = createCircuit(example1);
    circuit.nodalAnalysis();

})();