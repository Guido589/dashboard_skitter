import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

let options = {
    name: 'dagre',
    directed: true,
    grid: true,
    fit: true,
    maximal: true,
    rankDir: 'LR'
}

let nodesWorkers = [
    { data: { id: 'a' } },
    { data: { id: 'b' } },
    { data: { id: 'c' } },
    { data: { id: 'd' } },
];

let edgesWorkers = [
    { data: { id: 'ab', source: 'a', target: 'b'} },
    { data: { id: 'bd', source: 'b', target: 'd'} },
    { data: { id: 'cd', source: 'c', target: 'd'} },
    { data: { id: 'ac', source: 'a', target: 'c'} },
];

var cy = cytoscape({
        container: document.querySelector('#cy'),
        layout: options,
        style: cytoscape.stylesheet()
            .selector('node')
            .css({
                'background-color': '#fff',
                'shape': 'rectangle',
                'border-width': '1px',
                'border-color': 'black',
                'content': 'data(id)',
                'text-valign': 'center',
                'text-halign': 'center',
            })
            .selector('edge')
            .css({
                'width': '1px',
                'line-color': 'black',
                'target-arrow-shape': 'triangle',
                'source-arrow-color': 'black',
                'target-arrow-color': 'black',
                'curve-style': 'bezier'
            }),
        elements: {
            nodes: nodesWorkers,
            edges: edgesWorkers,
        },
        userZoomingEnabled: false,
        userPanningEnabled: false,
        autoungrabify: true
    });

function addWorker(workerName,) {
    cy.add([{ group: "nodes", data: { id: workerName}}]);
    cy.makeLayout(options).run()
}

function addEdge(source, target) {
    const idEdge = source.concat(target);
    cy.add([{ group: "edges", data: { id: idEdge, source: source, target: target } }]);
    cy.makeLayout(options).run()
    
}

addWorker("e");
addEdge("d", "e");