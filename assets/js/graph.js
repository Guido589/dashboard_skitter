import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const workersGraph = createGraph("workerGraph");
const componentsGraph = createGraph("componentGraph");

let options = {
    name: 'dagre',
    directed: true,
    grid: true,
    fit: true,
    maximal: true,
    rankDir: 'LR'
}

function createGraph(name){
    var cy = cytoscape({
        container: document.querySelector('#'+name),
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
                'text-wrap': 'wrap',
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
    return cy;
}

function addNodes(graph, nodes, textFormat) {
    for (let idx = 0; idx < nodes.length; idx++) {
        const curNode = nodes[idx];

        const node = { 
            group: "nodes", 
            data: { 
                id: curNode.id,
                name: textFormat(curNode)
            }
        };
        graph.add([node]); 
    }
    graph.makeLayout(options).run();
    graph.fit(graph.nodes);
}

function addEdges(graph, source, targets) {
    for (let idx = 0; idx < targets.length; idx++) {
        const target = targets[idx];
        const idEdge = source.concat(target);
        graph.add([{ group: "edges", data: { id: idEdge, source: source, target: target } }]);
    }
    graph.makeLayout(options).run();
    graph.fit();
}

export {addNodes, addEdges, createGraph, workersGraph, componentsGraph}