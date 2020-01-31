const left = document.getElementById('left-div');

function sfgToCyto(sfg) {
  if (!sfg) {
    return;
  }

  const nodes = [], edges = [];
  sfg.forEach(n => {
    let _id = n.value !== null ? n.value.toString() : n.id;
    console.log(_id);
    nodes.push({
      data: {id: n.id, value: _id.substring(0, 7)}
    });

    n.outgoingEdges.forEach(e => {
      edges.push({
        data: {
          id: e.id,
          edgeWeight: e.weight.substring(0, 7),
          source: e.startNode,
          target: e.endNode
        }
      });
    });
  });
  return {nodes, edges};
}

function generateSFG() {
  const sfg = localStorage.getItem('sfg_nodes');
  console.log(sfg);
  const elements = sfgToCyto(JSON.parse(sfg));
  cytoscape({
    container: document.getElementById('sfg-canvas'), // container to render in
    elements,
    style: cyto.style,
    layout: cyto.layout
  });
}