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
                'content': 'data(name)',
                'text-valign': 'center',
                'text-halign': 'center',
                'width': 'label'
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
            nodes: [],
            edges: [],
        },
        userZoomingEnabled: false,
        userPanningEnabled: false,
        autoungrabify: true
    });

function addWorkers(workers) {
    for (let idx = 0; idx < workers.length; idx++) {
        const worker = workers[idx];
        const workerName = worker.name;
        const workerId = worker.pid;
        const node = { group: "nodes", data: { id: workerId, name: workerName }};
        cy.add([node]); 
    }
    cy.makeLayout(options).run();
    cy.fit(cy.nodes);
}

function addEdges(source, targets) {
    for (let idx = 0; idx < targets.length; idx++) {
        const target = targets[idx];
        const idEdge = source.concat(target);
        cy.add([{ group: "edges", data: { id: idEdge, source: source, target: target } }]);
    }
    cy.makeLayout(options).run();
    cy.fit();
}

export {addWorkers, addEdges}